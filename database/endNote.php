<?php

include_once("config.inc.php");

class ParseEndNote
{	
        protected $objPDO;

        //constructors and destructor to connect/disconnect from the database
	public function __construct()
	{                
		global $objPDO;
        try{
				$objPDO=new PDO(DSN);
				$objPDO->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
				//print "successfully connected.....\n";
				//return $objPDO;
			}
		catch(PDOException $e){
				//echo " an error occurred ".$e->getMessage();
				die('{success:false, msg:"'.$e->getMessage().'"}');
			}		
	}
	public function __destruct()
	{
		global $objPDO;
                if($objPDO){
					$objPDO=null;		
		}
                //print "disconnected\n";
		return $this;
	}


public function parseXML($input)
    {

    global $objPDO; 
    
    
    //remember that the xml file has an encoding!!!
    $objReader = new XMLReader();
    //$objReader->open('Howgills.xml');
    $objReader->open($input);


    $count=0;
    $countAbstract=0;
    $authors="";
    $singleAuth=true;
    $title="";
    $periodical="";
    $pages="null";
    $volume="";
    $number="";
    $year="null";
    $year2="";
    $abstract="";
    $url="";
    $pub_location="";
    $publisher="";
    $startPage="";
    $endPage="";
    $doi="";
    $NCA_ID="170";
    $SOURCE_ID="100";
    $PLACE_ID="533903";

    //array to store the sql instructions
    $sql = array();
    $sqlAbstract=array();

    while ($objReader->read()) {
        if ($objReader->nodeType==XMLREADER::ELEMENT) {
            if ($objReader->localName=='record'){

                $count+=1;
                //initialize variables for a record
                $ref_type="";
                $ref_typeName="";
                $authors="";
                $singleAuth=true;
                $year="null";
                $year2="null";
                $title="";
                $periodical="null";
                $pages="";
                $volume="null";
                $number="null";
                $pub_location="null";
                $publisher="null";
                $abstract="";
                $url="null";
                $startPage="null";
                $endPage="null";
                $doi="null";
                $NCA_ID="170";
                $SOURCE_ID="100";
                $PLACE_ID="533903";

                //echo('<b>I got a record!!!</b><br/>');
                $isRecord=true;

                    while ($isRecord && $objReader->read()){


                        if(!($objReader->localName=='record' && $objReader->nodeType==XMLREADER::END_ELEMENT)){


                        if($objReader->nodeType==XMLREADER::ELEMENT){
                            switch ($objReader->localName) {
                            case 'ref-type':
                            if ($objReader->hasAttributes){
                                    $ref_typeName.=$objReader->getAttribute('name');                                    
                                } 
                            while ($objReader->read()){
                                if ($objReader->nodeType==XMLREADER::TEXT && $objReader->hasValue){                                 
                                    $ref_type.=$objReader->value;
                                    break;
                                }
                                }                               
                            //echo('  '.$objReader->localName.'<br/>');                          
                            break;    
                            case 'author':                       
                            //echo('=>'.$objReader->localName.'<br/>');
                            while ($objReader->read()){
                                if ($objReader->nodeType==XMLREADER::TEXT && $objReader->hasValue){
                                    if  ($singleAuth){
                                    $authors.=$objReader->value;    
                                    } else{
                                    $authors.=';'.$objReader->value;                                       
                                    }
                                    //echo('=>=>'.$objReader->value.'<br/>');
                                    $singleAuth=false;
                                    break;
                                }                        
                            }                        
                            break; 
                            case 'auth-address':
                            //echo('  '.$objReader->localName.'<br/>');
                            break; 
                            case 'title':
                                while ($objReader->read()){
                                if ($objReader->nodeType==XMLREADER::TEXT && $objReader->hasValue){
                                        $title.=$objReader->value;
                                    break;
                                }
                                }                           
                            //echo('  '.$objReader->localName.'<br/>');
                            break; 
							 case 'secondary-title':
                            //case 'periodical':
                                while ($objReader->read()){
                                if ($objReader->nodeType==XMLREADER::TEXT && $objReader->hasValue){
                                    $periodical=$objReader->value;
                                    break;
                                }
                                }                            
                            //echo('  '.$objReader->localName.'<br/>');
                            break; 
                            case 'pages':
                                while ($objReader->read()){
                                if ($objReader->nodeType==XMLREADER::TEXT && $objReader->hasValue){
                                    $pages.=$objReader->value;
                                    break;
                                }
                                }                            
                            //echo('  '.$objReader->localName.'<br/>');
                            break; 
                            case 'volume':
                                while ($objReader->read()){
                                if ($objReader->nodeType==XMLREADER::TEXT && $objReader->hasValue){
                                    $volume=$objReader->value;
                                    break;
                                }
                                }                          
                            //echo('  '.$objReader->localName.'<br/>');
                            break;
                            case 'number':
                                while ($objReader->read()){
                                if ($objReader->nodeType==XMLREADER::TEXT && $objReader->hasValue){
                                    $number=$objReader->value;
                                    break;
                                }
                                }                           
                            //echo('  '.$objReader->localName.'<br/>');                    
                            break; 
                            case 'year':
                            while ($objReader->read()){
                                if ($objReader->nodeType==XMLREADER::TEXT && $objReader->hasValue){
                                    $year=$objReader->value;
                                    break;
                                }
                                } 
                            //echo('  '.$objReader->localName.'<br/>');                    
                            break; 
                            case 'abstract':
                                while ($objReader->read()){
                                if ($objReader->nodeType==XMLREADER::TEXT && $objReader->hasValue){
                                    $abstract.=$objReader->value;
                                    break;
                                }
                                } 
                            //echo('  '.$objReader->localName.'<br/>');                      
                            break; 
                            case 'url':
                                while ($objReader->read()){
                                if ($objReader->nodeType==XMLREADER::TEXT && $objReader->hasValue){
                                    $url=$objReader->value;
                                    break;
                                }
                                } 
                            //echo('  '.$objReader->localName.'<br/>');                       
                            break;                       
                            case'pub-location':
                            while ($objReader->read()){
                                if ($objReader->nodeType==XMLREADER::TEXT && $objReader->hasValue){
                                    $pub_location=$objReader->value;
                                    break;
                                }
                                }  
                            break;
                            case'publisher':
                                while ($objReader->read()){
                                if ($objReader->nodeType==XMLREADER::TEXT && $objReader->hasValue){
                                    $publisher=$objReader->value;
                                    break;
                                }
                                } 
                            break;
                        }
                    }

                    }  
                        else{$isRecord=false;}

                }

                //DEBUG
                /*
                echo('Record: '.$count.'<br/><br/>');
                echo('Ref_type code: '.$ref_type.'<br/><br/>');
                echo('Ref_type name: '.$ref_typeName.'<br/><br/>');
                echo($authors.'<br/><br/>');
                echo($title.'<br/><br/>');
                echo('periodical: '.$periodical.'<br/><br/>');
                echo('pages: '.$pages.'<br/><br/>');
                echo('volume: '.$volume.'<br/><br/>');
                echo('number: '.$number.'<br/><br/>');
                echo('year: '.$year.'<br/><br/>');
                echo('abstract: '.$abstract.'<br/><br/>');
                echo('url: '.$url.'<br/><br/>');
                echo('location: '.$pub_location.'<br/><br/>');
                echo('publisher: '.$publisher.'<br/><br/>');
                echo('---------------------<br/><br/>');
                */
                
                
                if ($pages!="null"){
                    if(strpos($pages, '-') !== false){
                        $pagesArray = explode("-",$pages);
                        $startPage=$pagesArray[0];
                        $endPage=$pagesArray[1];
                    }else {$startPage!=$pages;}

                }


                //set correct punctuation               
                if ($authors!=""){$authors="'".str_replace ("'","''",$authors)."'"; }
                
                if ($title!=""){$title="'".str_replace ("'","''",$title)."'"; }
                
                if ($periodical!="null"){$periodical="'".str_replace ("'","''",$periodical)."'"; }            
                if ($volume!="null"){$volume="'".str_replace ("'","''",$volume)."'"; }            
                if ($year2!="null"){$year2="'".str_replace ("'","''",$year2)."'"; } 
                
                if ($publisher!="null"){$publisher="'".str_replace ("'","\'",$publisher)."'"; }
                
                if ($url!="null"){$url="'".str_replace ("'","''",$url)."'"; }
                if ($doi!="null"){$doi="'".str_replace ("'","''",$doi)."'"; }
                

                //create insert statement and put in the array
                $insert ="INSERT INTO \"landscape\".\"ARTICLE\" (\"AUTHOR\",\"TITLE\",\"PUB_NAME\",\"START_PAGE\",\"END_PAGE\",\"VOL\",\"YEAR\",\"YEAR2\",\"PUBLISHER\",\"LINK\",\"DOI\",\"NCA_ID\",\"SOURCE_ID\",\"PLACE_ID\") VALUES (".$authors.",".$title.",".$periodical.",".$startPage.",".$endPage.",".$volume.",".$year.",".$year2.",".$publisher.",".$url.",".$doi.",".$NCA_ID.",".$SOURCE_ID.",".$PLACE_ID.")  RETURNING \"ART_ID\"";
                $sql[$count]=$insert;
                //store the abstract
                if ($abstract!=""){
                    //$abs='INSERT INTO "public"."ABSTRACT" ("TEXT","ART_ID")
                    //VALUES ($abstract, :ID) RETURNING "ABSTR_ID"';   
                    $sqlAbstract[$count]=str_replace ("'","''",$abstract);              
                } else {$sqlAbstract[$count]="";}

                }

            }else{         
                //echo('I got an element '.$objReader->localName.'<br/>'); 
            }        

    }


    //debug
    //print_r($sql);
    //print_r($sqlAbstract);
    
    
    
            //insert into database
            
            try{

                $abs='INSERT INTO "landscape"."ABSTRACT" ("TEXT","ART_ID")VALUES (:ABSTRACT, :ID)'; 
                $id;

                //prepare sql to insert the abstract
                $objStatement=$objPDO->prepare($abs);

                //begin a transaction
                $objPDO->beginTransaction();
                //execute each insert statement
                for($i=1; $i <=count($sql) ; $i++) {
                    //execute the insert statement in the article table and get the id of the inserted row
                    $objStatement2=$objPDO->prepare($sql[$i]);
                    $objStatement2->execute();         
                    while( $arRow=$objStatement2->fetch(PDO::FETCH_ASSOC)){
                                $id=$arRow['ART_ID'];			
                        }
                    $objStatement2->closeCursor();

                    //if there is an abstract use the previous id to insert it in the abstract table
                    if ($sqlAbstract[$i]!=""){
                            $abstr=$sqlAbstract[$i];
                            $countAbstract+=1;
                            $objStatement->bindParam(':ID', $id, PDO::PARAM_INT);
                            $objStatement->bindParam(':ABSTRACT', $abstr, PDO::PARAM_STR);
                            $objStatement->execute();
                            $objStatement->closeCursor();
                    }
                }

                //finally commit the queries
                $objPDO->commit();
                echo('{success:true, msg:"inserted '.$count.' articles and '.$countAbstract.' abstracts", inserted:"'.$count.'"}');

            }
            catch(PDOException $e){
                    $objPDO->rollBack();
                    //die('{success:false, msg:"'.$e->getMessage().'"}');
                    die('{success:false, msg:"'.$e->getMessage().'"}');
            }
        
        }//end functionn parse

} //end class


//echo '{success:true,msg:"success"}';

$uploaddir = './xml/';
$uploadfile = $uploaddir . basename($_FILES['xml']['name']);

//check extrension and dimension
if ((($_FILES['xml']['type'] == 'application/xml')||($_FILES['xml']['type'] == 'text/xml'))
&& ($_FILES['xml']['size'] < 10485760))
  {
    //look for errors
    if ($_FILES['xml']['error'] > 0)
        {
        echo '{success:false,msg:"'.$_FILES['xml']['error'] . '"}';
        }
    else
        {
            if (move_uploaded_file($_FILES['xml']['tmp_name'], $uploadfile)) {
                $parser=new ParseEndNote();
                $parser->parseXML($uploadfile);
                //echo '{success:true,msg:"success"}';
            } else {
                echo '{success:false,msg:"problems uploading the file"}';
            }
    }
    }else
    {
        echo '{success:false,msg:"invalid file"}';
    }

//$parser->parseXML('PhD.xml');
//$parser->parseXML('unpreport.xml');
//$parser->parseXML('Chiverrell.xml');

?>