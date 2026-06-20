<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$from_name  = htmlspecialchars($data['from_name'] ?? '');
$from_email = htmlspecialchars($data['from_email'] ?? '');
$phone      = htmlspecialchars($data['phone'] ?? '');
$message    = htmlspecialchars($data['message'] ?? '');

$to      = 'info@garciaconstrucciones503.com';
$subject = 'Nuevo contacto desde la web';
$body    = "Nombre: $from_name\nEmail: $from_email\nTeléfono: $phone\n\nMensaje:\n$message";
$headers = "From: no-reply@garciaconstrucciones503.com\r\nReply-To: $from_email\r\nX-Mailer: PHP";

if (mail($to, $subject, $body, $headers)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al enviar']);
}
