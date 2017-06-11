<?php

$message="";

//set the error reporting
error_reporting(E_ALL|E_STRICT);

// handle the raised errors
set_error_handler('handleErrors');
function handleErrors($error,$errorString,$filename,$line,$simbols){       
		global $message;
		$o['success']=false;
		//$o['msg']='problems deleting images on the server';
		$o['msg']=trim( preg_replace( '/\s+/', ' ',htmlentities(str_replace('"',"'",$message))));
		$o['type']="raise error";
		echo json_encode($o);
		die();
}

//handle the uncaught errors
set_exception_handler('handleMissedExceptions');
function handleMissedExceptions($error){     
		global $message;
		$o['success']=false;
		//$o['msg']='problems deleting images on the server';
		$o['msg']=trim( preg_replace( '/\s+/', ' ',htmlentities(str_replace('"',"'",$message))));
		$o['type']="exception error";
		echo json_encode($o);
		die();
}

//TODO is it safe to tell the message to the cliet? it contains the image link

register_shutdown_function('handleShutdown');
function handleShutdown() {
        global $message;
		$error = error_get_last();
        if($error !== NULL){			 
			echo '{success: false, msg2:"'.$error['message'].'", msg:"'.trim( preg_replace( '/\s+/', ' ',htmlentities(str_replace('"',"'",$message)))).'"}';
			//echo '{success:false, msg:\'problems deleting images on the server\'}';
			die();
        }
        else{
             //the file shutdown without errors so i tell nothing
			 //echo '{success:true}';
        }
}

if(isset($_POST['id'])){

$dir = '../landscape/img/'.$_POST['table'].'/ori/'.$_POST['id'].'/';
$dir_thumbs = '../landscape/img/'.$_POST['table'].'/thumbs/'.$_POST['id'].'/';
$vis_thumbs='../landscape/img/'.$_POST['table'].'/visual/'.$_POST['id'].'/';

$arrayImg = explode(";", $_POST['images']);

foreach($arrayImg as $imgname) {
    if ($imgname != "") {	
	    //delete from the database and then from the server
		if (deleteImages($_POST['id'],$imgname,$_POST['table'])){	
			unlink($dir.$imgname);
			unlink($dir_thumbs.'thumb_'.$imgname);
			unlink($vis_thumbs.'vis_'.$imgname);
		}
	}
}
die('{success: true, msg:"'.trim( preg_replace( '/\s+/', ' ',htmlentities(str_replace('"',"'",$message)))).'"}');
}

//add a row to the database
function deleteImages($id,$name,$table){		
						
		global $message;
		
		$db;						
			// Open the database connection
			//if (!($db = pg_connect( 'host=postgres.int.devisland.net dbname=db_piccicla user=piccicla password=fidelin1'))) {
			if (!($db = pg_connect( 'host=localhost dbname=landscape user=postgres password=fidelin1'))) {			
				//$databaseFailed++;
				$message .= "-line 385:".$e->getMessage();
				return false;
			}						
						
			$sql ='delete from "landscape"."'.$table.'" where "ART_ID"='.$id.' AND "LINK"=\''.$name.'\'';
			
			if (!pg_connection_busy($db)) {
				  pg_send_query($db, $sql);
			}else 	{return false;}		  			
			If (!$rs = pg_get_result($db)){
					if ($db){
					    //$message .= pg_last_error();
						$message .= pg_result_error($rs);
						pg_close($db);
					}
					else {
					$message .= "-line 402 insert failed for ".$name;
					}	
			        //$databaseFailed++;
					return false;
			}else{		
			//close the connection				
				$errore=pg_result_error($rs);
				if($errore){
					$message .= $errore;
					//$databaseFailed++;
					pg_close($db);
					return false;
					}else{//$databaseUploaded++;
					pg_close($db);
					return true;
					}
			}					
			//$rows = pg_num_rows($res);					
}
?>