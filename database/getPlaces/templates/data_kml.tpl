<?xml version='1.0' encoding='UTF-8'?>
<kml xmlns='http://earth.google.com/kml/2.1'>
<Document>
<Style id='defaultStyle'>
<LineStyle><color>ff00ff00</color><width>3</width></LineStyle>
<PolyStyle><color>5f00ff00</color><outline>1</outline></PolyStyle>
</Style>
<!--(section name=sec loop=$rs)-->
<Placemark>
<name><!--($rs[sec].id|escape:html)--></name>
<description>
<!--(foreach from=$rs[sec] key=prop item=val)-->
<!--(if $prop != 'geom' && $prop != 'id')-->
<b><!--($prop|escape:html)--></b> <!--($val|escape:html)--><br />
<!--(/if)-->
<!--(/foreach)-->
</description>
<styleUrl>#defaultStyle</styleUrl>
<!--($rs[sec].geom)-->
</Placemark>
<!--(/section)-->
</Document>
</kml>