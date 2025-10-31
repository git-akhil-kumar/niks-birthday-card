<?php
// Simple access logs endpoint: show/add/clear
// Storage: JSON array in server-logs.json at project root
// Security: Token-based auth for show/clear actions

// Set your secret token here (change this to a random string)
$SECRET_TOKEN = isset($_ENV['LOGS_TOKEN']) ? $_ENV['LOGS_TOKEN'] : 'change-this-to-a-secure-random-token';

header('Content-Type: application/json');
header('Cache-Control: no-store');

$file = __DIR__ . '/server-logs.json';
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
    @file_put_contents($file, json_encode($logs));
    return count($logs);
}

function check_auth($token, $secret) {
    return $token === $secret && strlen($secret) > 10;
}

$action = isset($_GET['action']) ? $_GET['action'] : 'show';
$token = isset($_GET['token']) ? $_GET['token'] : '';

// add action - no auth required (public logging)
if ($action === 'add') {
    $body = file_get_contents('php://input');
    $entry = json_decode($body, true);
    if (!is_array($entry)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'invalid entry']);
        exit;
    }
    $entry['server_ts'] = gmdate('c');
    $entry['ip'] = $_SERVER['REMOTE_ADDR'] ?? '';
    $logs = read_logs($file);
    $logs[] = $entry;
    $count = write_logs($file, $logs);
    echo json_encode(['ok' => true, 'count' => $count]);
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
    $logs = read_logs($file);
    $out = array_slice($logs, -$limit);
    // Return raw JSON array for direct viewing
    header('Content-Type: application/json');
    echo json_encode($out, JSON_PRETTY_PRINT);
    exit;
}

// Default: error
http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'invalid action']);
?>


