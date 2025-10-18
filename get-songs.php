<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$songsDir = 'static/songs/';
$songs = [];

if (is_dir($songsDir)) {
    $files = scandir($songsDir);
    
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'mp3') {
            $songs[] = $file;
        }
    }
    
    // Sort songs alphabetically
    sort($songs);
}

echo json_encode($songs);
?>
