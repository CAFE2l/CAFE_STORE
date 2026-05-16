<?php
require_once __DIR__ . '/config/helpers.php';
session_destroy();
session_start();
flash('success', 'Você saiu da conta.');
redirect('index.php');
