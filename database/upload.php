<?php

///global variables

//this is the message for shutdown with no errors
$outputText="";

//variable for rows that failed in the database
$databaseFailed=0;
$databaseUploaded =0;
$message="";

//variable for uploaded images
$uploaded = 0;
$failed = 0;


//set the error reporting
error_reporting(E_ALL|E_STRICT);

// handle the raised errors
set_error_handler('handleErrors');
function handleErrors($error,$errorString,$filename,$line,$simbols){

        global $failed,$uploaded,$databaseFailed,$databaseUploaded,$message;
         
		$o['success']=false;
		//$o['msg']=str_replace('"',"'",$errorString);
		$o['msg']=trim( preg_replace( '/\s+/', ' ',htmlentities(str_replace('"',"'",$errorString))));
		$o['msg2']=trim( preg_replace( '/\s+/', ' ',htmlentities(str_replace('"',"'",$message))));
		$o['failed']=$failed;
		$o['uploaded']=$uploaded;
		$o['databaseFailed']=$databaseFailed;
		$o['databaseUploaded']=$databaseUploaded;
		$o['line']=trim( preg_replace( '/\s+/', ' ',htmlentities(str_replace('"',"'",$line))));
		//$o['simbols']=str_replace("\"","'",$simbols);
		$o['type']="raise error";
		echo json_encode($o);
		die();
}

//handle the uncaught errors
set_exception_handler('handleMissedExceptions');
function handleMissedExceptions($error){     
		$o['success']=false;
		$o['msg']=trim( preg_replace( '/\s+/', ' ',htmlentities(str_replace('"',"'",$error->getMessage()))));
		$o['msg2']='';
		$o['failed']=$failed;
		$o['uploaded']=$uploaded;
		$o['databaseFailed']=$databaseFailed;
		$o['databaseUploaded']=$databaseUploaded;
		$o['line']=trim( preg_replace( '/\s+/', ' ',htmlentities(str_replace('"',"'",$error->getLine()))));
		$o['type']="exception error";
		echo json_encode($o);
		die();
}

//I did this because if there is memorylimit problems when using imagecreatefromjpeg a fatal exception is thrown
//a fatal exception is not caught by a try/catch but i can detect the shutdown
//I used @ in front of imagecreatefromjpeg to suppress the fatal error html sent to the client and send only the json back
//memory error info http://drupal.org/node/76156
//now the memory_limit = 256M in php.ini
register_shutdown_function('handleShutdown');
function handleShutdown() {
        
		global $failed,$uploaded,$databaseFailed,$databaseUploaded,$message;
		
		$error = error_get_last();
        if($error !== NULL){
            //$info = "[SHUTDOWN] file:".$error['file']." | ln:".$error['line']." | msg:".$error['message'] .PHP_EOL;
            //$info = "SHUTDOWN ".$error['message'] .PHP_EOL.""; 			 
		    echo '{success:false, msg:"-shutdown:'.$error['message'].'",failed: '.$failed.', uploaded: '.$uploaded.',databaseFailed:"'.$databaseFailed.'",databaseUploaded:"'.$databaseUploaded.'"}';			
        }
        else{}
    }

// in ie should add image/pjpeg
function createThumb($img_file, $ori_path, $thumb_path, $img_type,$square_size) {
           
		// get the image source
		$path = $ori_path;
		$img = $path.$img_file;
		switch ($img_type) {
			case "image/jpeg":
				$img_src = @imagecreatefromjpeg($img);                             
				break;
			case "image/pjpeg":
				$img_src = @imagecreatefromjpeg($img);
				break;
			case "image/png":
				$img_src = @imagecreatefrompng($img);
				break;
			case "image/x-png":
				$img_src = @imagecreatefrompng($img);
				break;
			case "image/gif":
				$img_src = @imagecreatefromgif($img);
				break;
                }
            
		$img_width = imagesx($img_src);
		$img_height = imagesy($img_src);

		$square_size = $square_size;

		// check width, height, or square
		if ($img_width == $img_height) {
			// square
			$tmp_width = $square_size;
			$tmp_height = $square_size;
		} else if ($img_height < $img_width) {
			// wide
			$tmp_height = $square_size;
			$tmp_width = intval(($img_width / $img_height) * $square_size);
			if ($tmp_width % 2 != 0) {
				$tmp_width++;
			}
		} else if ($img_height > $img_width) {
			$tmp_width = $square_size;
			$tmp_height = intval(($img_height / $img_width) * $square_size);
			if ($tmp_height % 2 != 0) {
				$tmp_height++;
			}
		}

		$img_new = imagecreatetruecolor($tmp_width, $tmp_height);
		imagecopyresampled($img_new, $img_src, 0, 0, 0, 0,
				$tmp_width, $tmp_height, $img_width, $img_height);

		// create temporary thumbnail and locate on the server
		$thumb = $thumb_path."thumb_".$img_file;
		switch ($img_type) {
			case "image/jpeg":
				@imagejpeg($img_new, $thumb);
				break;
			case "image/pjpeg":
				@imagejpeg($img_new, $thumb);
				break;
			case "image/png":
				@imagepng($img_new, $thumb);
				break;
			case "image/x-png":
				@imagepng($img_new, $thumb);
				break;
			case "image/gif":
				@imagegif($img_new, $thumb);
				break;
		}

		// get tmp_image
		switch ($img_type) {
			case "image/jpeg":
				$img_thumb_square = @imagecreatefromjpeg($thumb);
				break;
			case "image/pjpeg":
				$img_thumb_square = @imagecreatefromjpeg($thumb);
				break;
			case "image/png":
				$img_thumb_square = @imagecreatefrompng($thumb);
				break;
			case "image/x-png":
				$img_thumb_square = @imagecreatefrompng($thumb);
				break;
			case "image/gif":
				$img_thumb_square = @imagecreatefromgif($thumb);
				break;
		}

		$thumb_width = imagesx($img_thumb_square);
		$thumb_height = imagesy($img_thumb_square);

		if ($thumb_height < $thumb_width) {
			// wide
			$x_src = ($thumb_width - $square_size) / 2;
			$y_src = 0;
			$img_final = imagecreatetruecolor($square_size, $square_size);
			imagecopy($img_final, $img_thumb_square, 0, 0,
					$x_src, $y_src, $square_size, $square_size);
		} else if ($thumb_height > $thumb_width) {
			// landscape
			$x_src = 0;
			$y_src = ($thumb_height - $square_size) / 2;
			$img_final = imagecreatetruecolor($square_size, $square_size);
			imagecopy($img_final, $img_thumb_square, 0, 0,
					$x_src, $y_src, $square_size, $square_size);
		} else {
			$img_final = imagecreatetruecolor($square_size, $square_size);
			imagecopy($img_final, $img_thumb_square, 0, 0,
					0, 0, $square_size, $square_size);
		}

		switch ($img_type) {
			case "image/jpeg":
				@imagejpeg($img_final, $thumb);
				break;
			case "image/pjpeg":
				@imagejpeg($img_final, $thumb);
				break;
			case "image/png":
				@imagepng($img_final, $thumb);
				break;
			case "image/x-png":
				@imagepng($img_final, $thumb);
				break;
			case "image/gif":
				@imagegif($img_final, $thumb);
				break;
		}	
}

function createVis($img_file, $ori_path, $thumb_vis, $img_type,$square_size) {      
    // get the image source
    $path = $ori_path;
    $img = $path.$img_file;
    switch ($img_type) {
        case "image/jpeg":
            $img_src = @imagecreatefromjpeg($img);
            break;
        case "image/pjpeg":
            $img_src = @imagecreatefromjpeg($img);
            break;
        case "image/png":
            $img_src = @imagecreatefrompng($img);
            break;
        case "image/x-png":
            $img_src = @imagecreatefrompng($img);
            break;
        case "image/gif":
            $img_src = @imagecreatefromgif($img);
            break;
    }
    
	//get the original size
	$img_width = imagesx($img_src);
    $img_height = imagesy($img_src);
	//this is the new size
    $square_size = $square_size;
	
	//default: just copy the original image  
	$tmp_width=$img_width; 
	$tmp_height=$img_height;	
	
	//otherwise if the size is more than the new size
	if(!(($img_width <=$square_size)&&($img_height <=$square_size))){				 		   
		// check width, height, or square
		if ($img_width == $img_height) {
			// square
			$tmp_width = $square_size;
			$tmp_height = $square_size;
		} else if ($img_height < $img_width) {			
			$ratio=$square_size/$img_width;
			$tmp_height=$img_height*$ratio;
			$tmp_width=$img_width*$ratio;			
		} else if ($img_height > $img_width) {			
			$ratio=$square_size/$img_height;
			$tmp_height=$img_height*$ratio;
			$tmp_width=$img_width*$ratio;		
		}
	}
	
	$img_new = imagecreatetruecolor($tmp_width, $tmp_height);
	imagecopyresampled($img_new, $img_src, 0, 0, 0, 0,
			$tmp_width, $tmp_height, $img_width, $img_height);

	// create temporary thumbnail and locate on the server
	$thumb = $thumb_vis."vis_".$img_file;
	switch ($img_type) {
		case "image/jpeg":           
			@imagejpeg($img_new, $thumb);
			break;
		case "image/pjpeg":
			@imagejpeg($img_new, $thumb);
			break;
		case "image/png":
			@imagepng($img_new, $thumb);
			break;
		case "image/x-png":
			@imagepng($img_new, $thumb);
			break;
		case "image/gif":
			@imagegif($img_new, $thumb);
			break;
	}	
}


//if the post not exceeding 11M and therefore we receive the $_POST['id'](see post_max_size = 11M in the php.ini file)
if (isset($_POST['id'])){

$ori_dir = '../landscape/img/'.$_POST['table'].'/ori/'.$_POST['id'].'/';
$thumb_dir = '../landscape/img/'.$_POST['table'].'/thumbs/'.$_POST['id'].'/';
$visual_dir='../landscape/img/'.$_POST['table'].'/visual/'.$_POST['id'].'/';

//create directories if they no exist
if (!is_dir($ori_dir)){
mkdir($ori_dir , 0777);
}
if (!is_dir($thumb_dir)){
mkdir($thumb_dir , 0777);
}
if (!is_dir($visual_dir)){
mkdir($visual_dir , 0777);
}


$allowedType = array(
    'image/jpeg', 'image/pjpeg', 'image/png', 'image/gif', 'image/x-png'
);

foreach($_FILES['img']['name'] as $key => $img) {
    if (in_array($_FILES['img']['type'][$key], $allowedType)) {
        // max upload file is 10 mb  see http://www.onlineconversion.com/computer_base2.htm
        if ($_FILES['img']['size'][$key] <= 10485760) {
            // upload file
            move_uploaded_file($_FILES['img']['tmp_name'][$key],
                    $ori_dir.$_FILES['img']['name'][$key]);
           
            // create thumbnail
            createThumb($_FILES['img']['name'][$key],
                $ori_dir, $thumb_dir,
                $_FILES['img']['type'][$key],100);
                                                          			
			// create visualization images (change the value to your preferred value)
            createVis($_FILES['img']['name'][$key],
                $ori_dir, $visual_dir,
                $_FILES['img']['type'][$key],600);
						
			// count how many files uploaded
            $uploaded++;
			//$message.= $_POST['id']."-".$_FILES['img']['name'][$key];
			
			//Add to the database!!!
			setImages($_POST['id'],$_FILES['img']['name'][$key],$_POST['table']);
						
        } else {
            $failed++;
        }
    } else if ($_FILES['img']['type'][$key] != '') {
        $failed++;
    }
}
die('{success: true, exceed: false, failed: '.$failed.', uploaded: '.$uploaded.', type: "'.$_FILES['img']['type'][0].'",databaseFailed:'.$databaseFailed.',databaseUploaded:'.$databaseUploaded.',msg:"'.trim( preg_replace( '/\s+/', ' ',htmlentities(str_replace('"',"'",$message)))).'"}');
}
else {//this causes script shutdown
//die('{success: true, exceed: true, failed: '.$failed.', uploaded: '.$uploaded.',databaseFailed:'.$databaseFailed.',databaseUploaded:'.$databaseUploaded.',msg:"'.trim( preg_replace( '/\s+/', ' ',htmlentities(str_replace('"',"'",$message)))).'"}');
}

//add a row to the database
function setImages($id,$name,$table){		
		
		global $databaseFailed,$databaseUploaded,$message;
		
		$db;						
			// Open the database connection
			//if (!($db = pg_connect( 'host=postgres.int.devisland.net dbname=db_piccicla user=piccicla password=fidelin1'))) {
			if (!($db = pg_connect( 'host=localhost dbname=landscape user=postgres password=fidelin1'))) {			
				$databaseFailed++;
				$message .= "-line 385:".$e->getMessage();
			}						
			//insert "LINK" from "PHOTO" where "ART_ID"='.$id;
			$sql = 'INSERT INTO "landscape"."'.$table.'" ("ART_ID","LINK") VALUES ('.$id.',\''.$name.'\')';
			
			if (!pg_connection_busy($db)) {
				  pg_send_query($db, $sql);
			}			  			
			If (!$rs = pg_get_result($db)){
					if ($db){
					    //$message .= pg_last_error();
						$message .= pg_result_error($rs);
						pg_close($db);
					}
					else {
					$message .= "-line 402 insert failed for ".$name;
					}	
			        $databaseFailed++;
			}else{		
			//close the connection				
				$errore=pg_result_error($rs);
				if($errore){
					$message .= $errore;
					$databaseFailed++;
					}else{$databaseUploaded++;}
                pg_close($db);
			}					
			//$rows = pg_num_rows($res);					
}

?>