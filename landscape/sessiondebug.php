<?php
    session_start();
    foreach ($_SESSION as $key=>$val)
    echo "<b>".$key."</b> ".$val." <br/>";
?>