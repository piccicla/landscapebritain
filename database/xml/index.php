<?php

$r=new XMLReader();
$r->open('Howgills.xml');

while ($r->read()){
    switch ($r->nodeType){
        case  XMLREADER::ELEMENT:
            echo("<".$r->localName.">");
            break;
        case  XMLREADER::END_ELEMENT:
            echo("</".$r->localName.">");
            break;
        case  XMLREADER::TEXT:
        case  XMLREADER::CDATA:
        case  XMLREADER::WHITESPACE:
        case  XMLREADER::SIGNIFICANT_WHITESPACE: 
            echo($r->value);       
    }    
}
?>
