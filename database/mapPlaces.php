<?php

$ar = $_POST['place'];
$places = explode(",",$ar);
if (isset($ar)){

//$results = array();
/*
for ($i=0;$i<10;$i++){
//$results[]=$places[$i];
}*/

$o= array();
$o['success']=true;
$o['results']=$places;
echo json_encode($o);
}

?>