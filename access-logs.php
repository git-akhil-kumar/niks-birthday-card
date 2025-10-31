<?php
// Simple access logs endpoint: show/add/clear
// Storage: JSON array in server-logs.json at project root
// Security: Token-based auth for show/clear actions

// Set your secret token here (change this to a random string)
$SECRET_TOKEN = isset($_ENV['LOGS_TOKEN']) ? $_ENV['LOGS_TOKEN'] : 'change-this-to-a-secure-random-token';

// Security headers
header('Content-Type: application/json');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

// Rate limiting storage
$rate_limit_file = __DIR__ . '/.rate-limit.json';

function get_rate_limit_data($file) {
    if (!file_exists($file)) return [];
    $raw = @file_get_contents($file);
    if ($raw === false) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function check_rate_limit($ip, $file) {
    $data = get_rate_limit_data($file);
    $now = time();
    $window_start = $now - 60; // 1 minute window
    $max_requests = 30; // Max 30 requests per minute per IP
    
    // Clean old entries
    $data[$ip] = array_filter($data[$ip] ?? [], function($ts) use ($window_start) {
        return $ts > $window_start;
    });
    
    if (count($data[$ip] ?? []) >= $max_requests) {
        return false;
    }
    
    $data[$ip][] = $now;
    @file_put_contents($file, json_encode($data));
    return true;
}

function sanitize_string($str, $max_len = 1000) {
    if (!is_string($str)) return '';
    $str = substr($str, 0, $max_len);
    return filter_var($str, FILTER_SANITIZE_STRING, FILTER_FLAG_STRIP_HIGH);
}

function validate_log_entry($entry) {
    if (!is_array($entry)) return false;
    // Limit entry size to prevent abuse
    if (strlen(json_encode($entry)) > 5000) return false;
    // Sanitize all string fields
    foreach ($entry as $key => $value) {
        if (is_string($value)) {
            $entry[$key] = sanitize_string($value, 500);
        } elseif (is_array($value)) {
            foreach ($value as $k => $v) {
                if (is_string($v)) {
                    $entry[$key][$k] = sanitize_string($v, 200);
                }
            }
        }
    }
    return $entry;
}

$file = __DIR__ . '/server-logs.json';
// Ensure file is in project root, prevent path traversal
$real_file = realpath($file);
$real_dir = realpath(__DIR__);
if ($real_file === false || strpos($real_file, $real_dir) !== 0) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'server error']);
    exit;
}

if (!file_exists($file)) {
    file_put_contents($file, json_encode([]));
}

function read_logs($file) {
    $raw = @file_get_contents($file);
    if ($raw === false) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function write_logs($file, $logs) {
    // Cap to last 2000 entries
    $logs = array_slice($logs, -2000);
    @file_put_contents($file, json_encode($logs, JSON_UNESCAPED_UNICODE));
    return count($logs);
}

function check_auth($token, $secret) {
    // Use timing-safe comparison to prevent timing attacks
    if (!is_string($token) || !is_string($secret) || strlen($secret) < 10) {
        return false;
    }
    return hash_equals($secret, $token);
}

$action = isset($_GET['action']) ? $_GET['action'] : 'show';
// Validate action against whitelist
$allowed_actions = ['add', 'show', 'clear'];
if (!in_array($action, $allowed_actions)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid action']);
    exit;
}

$token = isset($_GET['token']) ? $_GET['token'] : '';
$client_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

// add action - no auth required (public logging) but rate limited
if ($action === 'add') {
    if (!check_rate_limit($client_ip, $rate_limit_file)) {
        http_response_code(429);
        echo json_encode(['ok' => false, 'error' => 'rate limit exceeded']);
        exit;
    }
    
    $body = @file_get_contents('php://input');
    if ($body === false || strlen($body) > 10000) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'invalid request']);
        exit;
    }
    
    $entry = json_decode($body, true);
    $entry = validate_log_entry($entry);
    if ($entry === false) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'invalid entry']);
        exit;
    }
    
    $entry['server_ts'] = gmdate('c');
    $entry['ip'] = $client_ip;
    $logs = read_logs($file);
    $logs[] = $entry;
    $count = write_logs($file, $logs);
    echo json_encode(['ok' => true, 'count' => $count], JSON_UNESCAPED_UNICODE);
    exit;
}

// show and clear require authentication
if ($action === 'show' || $action === 'clear') {
    if (!check_auth($token, $SECRET_TOKEN)) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'unauthorized']);
        exit;
    }
}

if ($action === 'clear') {
    write_logs($file, []);
    echo json_encode(['ok' => true, 'count' => 0]);
    exit;
}

// show - return raw JSON array (for direct viewing)
if ($action === 'show') {
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 2000;
    // Enforce max limit to prevent DoS
    $limit = min(max(1, $limit), 5000);
    $logs = read_logs($file);
    $out = array_slice($logs, -$limit);
    // Return raw JSON array for direct viewing
    header('Content-Type: application/json');
    echo json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Default: error
http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'invalid action']);
?>


