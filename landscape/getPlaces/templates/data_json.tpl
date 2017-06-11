{
"type": "FeatureCollection",
"features": [
<!--(section name=sec loop=$rs)-->
{ "type": "Feature", "properties":
{"id":<!--($rs[sec].id|json_encode)-->
<!--(foreach from=$rs[sec] key=prop item=val)-->
<!--(if $prop != 'geom' && $prop != 'id')-->
,<!--($prop|json_encode)-->:<!--($val|json_encode)-->
<!--(/if)-->
<!--(/foreach)-->
},
"geometry": <!--($rs[sec].geom)-->
}
<!--(if not $smarty.section.sec.last)-->,<!--(/if)-->
<!--(/section)-->
]
}