<?php
// Simple access logs endpoint: show/add/clear
// Storage: JSON array in server-logs.json at project root

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

$action = isset($_GET['action']) ? $_GET['action'] : 'show';

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

if ($action === 'clear') {
    write_logs($file, []);
    echo json_encode(['ok' => true, 'count' => 0]);
    exit;
}

// show
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 200;
$logs = read_logs($file);
$out = array_slice($logs, -$limit);
echo json_encode(['ok' => true, 'count' => count($logs), 'logs' => $out]);
?>


