<?php
// Open the database connection
if (!($db = pg_connect( 'host=postgres.int.devisland.net dbname=db_piccicla user=piccicla password=fidelin1'))) {
// Handle errors
die('SQL ERROR: Connection failed: ' . pg_last_error($db));
}

// Select data from the table:
$sql = 'select "NAME" from "LEVEL1"';


$results = array();

/*if (!($result = pg_query($db, $sql))) {
// Give an error statement:
die('SQL SELECT ERROR: ' . pg_last_error($db). " - Query was: {$sql}");
Echo "{success:false}";
}
*/
// Read all the data back in as associative arrays
If (!$rs = pg_query($db, $sql) ){
		Echo "{success:false}";
		}else{
	while($obj = pg_fetch_object($rs)){
		$results[] = $obj;
	}}
print_r(array_values($results));

// Now close the connection
pg_close($db);
?>