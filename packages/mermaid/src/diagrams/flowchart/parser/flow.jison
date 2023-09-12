/** mermaid
 *  https://mermaidjs.github.io/
 *  (c) 2015 Knut Sveidqvist
 *  MIT license.
 */

/* lexical grammar */
%lex
%x string
%x md_string
%x acc_title
%x acc_descr
%x acc_descr_multiline
%x dir
%x vertex
%x click
%x href
%x callbackname
%x callbackargs
%x open_directive
%x type_directive
%x arg_directive
%x close_directive

%%
\%\%\{                                                          { this.begin('open_directive'); return 'open_directive'; }
<open_directive>((?:(?!\}\%\%)[^:.])*)                          { this.begin('type_directive'); return 'type_directive'; }
<type_directive>":"                                             { this.popState(); this.begin('arg_directive'); return ':'; }
<type_directive,arg_directive>\}\%\%                            { this.popState(); this.popState(); return 'close_directive'; }
<arg_directive>((?:(?!\}\%\%).|\n)*)                            return 'arg_directive';
accTitle\s*":"\s*                                               { this.begin("acc_title");return 'acc_title'; }
<acc_title>(?!\n|;|#)*[^\n]*                                    { this.popState(); return "acc_title_value"; }
accDescr\s*":"\s*                                               { this.begin("acc_descr");return 'acc_descr'; }
<acc_descr>(?!\n|;|#)*[^\n]*                                    { this.popState(); return "acc_descr_value"; }
accDescr\s*"{"\s*                                { this.begin("acc_descr_multiline");}
<acc_descr_multiline>[\}]                       { this.popState(); }
<acc_descr_multiline>[^\}]*                     return "acc_descr_multiline_value";
// <acc_descr_multiline>.*[^\n]*                    {  return "acc_descr_line"}
["][`]          { this.begin("md_string");}
<md_string>[^`"]+        { return "MD_STR";}
<md_string>[`]["]          { this.popState();}
["]                     this.begin("string");
<string>["]             this.popState();
<string>[^"]*           return "STR";
"style"               return 'STYLE';
"default"             return 'DEFAULT';
"linkStyle"           return 'LINKSTYLE';
"interpolate"         return 'INTERPOLATE';
"classDef"            return 'CLASSDEF';
"class"               return 'CLASS';

/*
---interactivity command---
'href' adds a link to the specified node. 'href' can only be specified when the
line was introduced with 'click'.
'href "<link>"' attaches the specified link to the node that was specified by 'click'.
*/
"href"[\s]+["]          this.begin("href");
<href>["]               this.popState();
<href>[^"]*             return 'HREF';

/*
---interactivity command---
'call' adds a callback to the specified node. 'call' can only be specified when
the line was introduced with 'click'.
'call <callbackname>(<args>)' attaches the function 'callbackname' with the specified
arguments to the node that was specified by 'click'.
Function arguments are optional: 'call <callbackname>()' simply executes 'callbackname' without any arguments.
*/
"call"[\s]+             this.begin("callbackname");
<callbackname>\([\s]*\) this.popState();
<callbackname>\(        this.popState(); this.begin("callbackargs");
<callbackname>[^(]*     return 'CALLBACKNAME';
<callbackargs>\)        this.popState();
<callbackargs>[^)]*     return 'CALLBACKARGS';

/*
'click' is the keyword to introduce a line that contains interactivity commands.
'click' must be followed by an existing node-id. All commands are attached to
that id.
'click <id>' can be followed by href or call commands in any desired order
*/
"click"[\s]+            this.begin("click");
<click>[\s\n]           this.popState();
<click>[^\s\n]*         return 'CLICK';

"flowchart-elk"        {if(yy.lex.firstGraph()){this.begin("dir");}  return 'GRAPH';}
"graph"                {if(yy.lex.firstGraph()){this.begin("dir");}  return 'GRAPH';}
"flowchart"            {if(yy.lex.firstGraph()){this.begin("dir");}  return 'GRAPH';}

"subgraph"            return 'subgraph';
"pool"                return 'pool';
"line"                return 'line';
"lend"\b\s*            return 'endline';
"pend"\b\s*            return 'endpool';
"end"\b\s*            return 'end';

"_self"               return 'LINK_TARGET';
"_blank"              return 'LINK_TARGET';
"_parent"             return 'LINK_TARGET';
"_top"                return 'LINK_TARGET';

<dir>(\r?\n)*\s*\n       {   this.popState();  return 'NODIR'; }
<dir>\s*"LR"             {   this.popState();  return 'DIR'; }
<dir>\s*"RL"             {   this.popState();  return 'DIR'; }
<dir>\s*"TB"             {   this.popState();  return 'DIR'; }
<dir>\s*"BT"             {   this.popState();  return 'DIR'; }
<dir>\s*"TD"             {   this.popState();  return 'DIR'; }
<dir>\s*"BR"             {   this.popState();  return 'DIR'; }
<dir>\s*"<"              {   this.popState();  return 'DIR'; }
<dir>\s*">"              {   this.popState();  return 'DIR'; }
<dir>\s*"^"              {   this.popState();  return 'DIR'; }
<dir>\s*"v"              {   this.popState();  return 'DIR'; }

.*direction\s+TB[^\n]*                                      return 'direction_tb';
.*direction\s+BT[^\n]*                                      return 'direction_bt';
.*direction\s+RL[^\n]*                                      return 'direction_rl';
.*direction\s+LR[^\n]*                                      return 'direction_lr';

[0-9]+                { return 'NUM';}
\#                    return 'BRKT';
":::"                 return 'STYLE_SEPARATOR';
":"                   return 'COLON';
"&"                   return 'AMP';
";"                   return 'SEMI';
","                   return 'COMMA';
"*"                   return 'MULT';
\s*[xo<]?\-\-+[-xo>]\s*     return 'LINK';
\s*[xo<]?\=\=+[=xo>]\s*     return 'LINK';
\s*[xo<]?\-?\.+\-[xo>]?\s*  return 'LINK';
\s*\~\~[\~]+\s*  return 'LINK';
\s*[xo<]?\-\-\s*            return 'START_LINK';
\s*[xo<]?\=\=\s*            return 'START_LINK';
\s*[xo<]?\-\.\s*            return 'START_LINK';
"(-"                  return '(-';
"-)"                  return '-)';

"{end_event_compensation"       return 'end_event_compensation_FIRST'

"end_event_compensation}"       return 'end_event_compensation_END'

"{end_event_cancel"       return 'end_event_cancel_FIRST'

"end_event_cancel}"       return 'end_event_cancel_END'

"{lane_divide_three"        return 'lane_divide_three_FIRST'

"lane_divide_three}"        return 'lane_divide_three_END'

"{intermediate_event_catch_parallel_multiple"       return 'intermediate_event_catch_parallel_multiple_FIRST'

"intermediate_event_catch_parallel_multiple}"       return 'intermediate_event_catch_parallel_multiple_END'

"{service"        return 'service_FIRST'

"service}"        return 'service_END'

"{end_event_signal"       return 'end_event_signal_FIRST'

"end_event_signal}"       return 'end_event_signal_END'

"{sequential_mi_marker"       return 'sequential_mi_marker_FIRST'

"sequential_mi_marker}"       return 'sequential_mi_marker_END'

"{intermediate_event_throw_escalation"        return 'intermediate_event_throw_escalation_FIRST'

"intermediate_event_throw_escalation}"        return 'intermediate_event_throw_escalation_END'

"{receive"        return 'receive_FIRST'

"receive}"        return 'receive_END'

"{intermediate_event_catch_signal"        return 'intermediate_event_catch_signal_FIRST'

"intermediate_event_catch_signal}"        return 'intermediate_event_catch_signal_END'

"{compensation_marker"        return 'compensation_marker_FIRST'

"compensation_marker}"        return 'compensation_marker_END'

"{start_event_parallel_multiple"        return 'start_event_parallel_multiple_FIRST'

"start_event_parallel_multiple}"        return 'start_event_parallel_multiple_END'

"{intermediate_event_catch_multiple"        return 'intermediate_event_catch_multiple_FIRST'

"intermediate_event_catch_multiple}"        return 'intermediate_event_catch_multiple_END'

"{end_event_escalation"       return 'end_event_escalation_FIRST'

"end_event_escalation}"       return 'end_event_escalation_END'

"{trash"        return 'trash_FIRST'

"trash}"        return 'trash_END'

"{start_event_non_interrupting_parallel_multiple"       return 'start_event_non_interrupting_parallel_multiple_FIRST'

"start_event_non_interrupting_parallel_multiple}"       return 'start_event_non_interrupting_parallel_multiple_END'

"{data_object"        return 'data_object_FIRST'

"data_object}"        return 'data_object_END'

"{end_event_error"        return 'end_event_error_FIRST'

"end_event_error}"        return 'end_event_error_END'

"{gateway_complex"        return 'gateway_complex_FIRST'

"gateway_complex}"        return 'gateway_complex_END'

"{intermediate_event_catch_error"       return 'intermediate_event_catch_error_FIRST'

"intermediate_event_catch_error}"       return 'intermediate_event_catch_error_END'

"{start_event_non_interrupting_escalation"        return 'start_event_non_interrupting_escalation_FIRST'

"start_event_non_interrupting_escalation}"        return 'start_event_non_interrupting_escalation_END'

"{intermediate_event_throw_link"        return 'intermediate_event_throw_link_FIRST'

"intermediate_event_throw_link}"        return 'intermediate_event_throw_link_END'

"{gateway_xor"        return 'gateway_xor_FIRST'

"gateway_xor}"        return 'gateway_xor_END'

"{lane_insert_below"        return 'lane_insert_below_FIRST'

"lane_insert_below}"        return 'lane_insert_below_END'

"{gateway_eventbased"       return 'gateway_eventbased_FIRST'

"gateway_eventbased}"       return 'gateway_eventbased_END'

"{intermediate_event_catch_non_interrupting_escalation"       return 'intermediate_event_catch_non_interrupting_escalation_FIRST'

"intermediate_event_catch_non_interrupting_escalation}"       return 'intermediate_event_catch_non_interrupting_escalation_END'

"{send"       return 'send_FIRST'

"send}"       return 'send_END'

"{gateway_none"       return 'gateway_none_FIRST'

"gateway_none}"       return 'gateway_none_END'

"{gateway_parallel"       return 'gateway_parallel_FIRST'

"gateway_parallel}"       return 'gateway_parallel_END'

"{intermediate_event_catch_message"       return 'intermediate_event_catch_message_FIRST'

"intermediate_event_catch_message}"       return 'intermediate_event_catch_message_END'

"{screw_wrench"       return 'screw_wrench_FIRST'

"screw_wrench}"       return 'screw_wrench_END'

"{end_event_multiple"       return 'end_event_multiple_FIRST'

"end_event_multiple}"       return 'end_event_multiple_END'

"{loop_marker"        return 'loop_marker_FIRST'

"loop_marker}"        return 'loop_marker_END'

"{end_event_link"       return 'end_event_link_FIRST'

"end_event_link}"       return 'end_event_link_END'

"{data_store"       return 'data_store_FIRST'

"data_store}"       return 'data_store_END'

"{start_event_condition"        return 'start_event_condition_FIRST'

"start_event_condition}"        return 'start_event_condition_END'

"{intermediate_event_throw_multiple"        return 'intermediate_event_throw_multiple_FIRST'

"intermediate_event_throw_multiple}"        return 'intermediate_event_throw_multiple_END'

"{data_input"       return 'data_input_FIRST'

"data_input}"       return 'data_input_END'

"{intermediate_event_catch_non_interrupting_message"        return 'intermediate_event_catch_non_interrupting_message_FIRST'

"intermediate_event_catch_non_interrupting_message}"        return 'intermediate_event_catch_non_interrupting_message_END'

"{intermediate_event_none"        return 'intermediate_event_none_FIRST'

"intermediate_event_none}"        return 'intermediate_event_none_END'

"{intermediate_event_catch_condition"       return 'intermediate_event_catch_condition_FIRST'

"intermediate_event_catch_condition}"       return 'intermediate_event_catch_condition_END'

"{parallel_mi_marker"       return 'parallel_mi_marker_FIRST'

"parallel_mi_marker}"       return 'parallel_mi_marker_END'

"{lane_insert_above"        return 'lane_insert_above_FIRST'

"lane_insert_above}"        return 'lane_insert_above_END'

"{end_event_terminate"        return 'end_event_terminate_FIRST'

"end_event_terminate}"        return 'end_event_terminate_END'

"{intermediate_event_throw_message"       return 'intermediate_event_throw_message_FIRST'

"intermediate_event_throw_message}"       return 'intermediate_event_throw_message_END'

"{start_event_signal"       return 'start_event_signal_FIRST'

"start_event_signal}"       return 'start_event_signal_END'

"{intermediate_event_catch_non_interrupting_multiple"       return 'intermediate_event_catch_non_interrupting_multiple_FIRST'

"intermediate_event_catch_non_interrupting_multiple}"       return 'intermediate_event_catch_non_interrupting_multiple_END'

"{intermediate_event_catch_non_interrupting_timer"        return 'intermediate_event_catch_non_interrupting_timer_FIRST'

"intermediate_event_catch_non_interrupting_timer}"        return 'intermediate_event_catch_non_interrupting_timer_END'

"{intermediate_event_throw_compensation"        return 'intermediate_event_throw_compensation_FIRST'

"intermediate_event_throw_compensation}"        return 'intermediate_event_throw_compensation_END'

"{manual"       return 'manual_FIRST'

"manual}"       return 'manual_END'

"{intermediate_event_catch_compensation"        return 'intermediate_event_catch_compensation_FIRST'

"intermediate_event_catch_compensation}"        return 'intermediate_event_catch_compensation_END'

"{gateway_or"       return 'gateway_or_FIRST'

"gateway_or}"       return 'gateway_or_END'

"{intermediate_event_catch_timer"       return 'intermediate_event_catch_timer_FIRST'

"intermediate_event_catch_timer}"       return 'intermediate_event_catch_timer_END'

"{start_event_none"       return 'start_event_none_FIRST'

"start_event_none}"       return 'start_event_none_END'

"{start_event_compensation"       return 'start_event_compensation_FIRST'

"start_event_compensation}"       return 'start_event_compensation_END'

"{start_event_non_interrupting_message"       return 'start_event_non_interrupting_message_FIRST'

"start_event_non_interrupting_message}"       return 'start_event_non_interrupting_message_END'

"{lane_divide_two"        return 'lane_divide_two_FIRST'

"lane_divide_two}"        return 'lane_divide_two_END'

"{user"       return 'user_FIRST'

"user}"       return 'user_END'

"{intermediate_event_throw_signal"        return 'intermediate_event_throw_signal_FIRST'

"intermediate_event_throw_signal}"        return 'intermediate_event_throw_signal_END'

"{start_event_non_interrupting_signal"        return 'start_event_non_interrupting_signal_FIRST'

"start_event_non_interrupting_signal}"        return 'start_event_non_interrupting_signal_END'

"{start_event_message"        return 'start_event_message_FIRST'

"start_event_message}"        return 'start_event_message_END'

"{end_event_message"        return 'end_event_message_FIRST'

"end_event_message}"        return 'end_event_message_END'

"{start_event_non_interrupting_timer"       return 'start_event_non_interrupting_timer_FIRST'

"start_event_non_interrupting_timer}"       return 'start_event_non_interrupting_timer_END'

"{business_rule"        return 'business_rule_FIRST'

"business_rule}"        return 'business_rule_END'

"{start_event_error"        return 'start_event_error_FIRST'

"start_event_error}"        return 'start_event_error_END'

"{hand_tool"        return 'hand_tool_FIRST'

"hand_tool}"        return 'hand_tool_END'

"{sub_process_marker"       return 'sub_process_marker_FIRST'

"sub_process_marker}"       return 'sub_process_marker_END'

"{intermediate_event_catch_non_interrupting_signal"       return 'intermediate_event_catch_non_interrupting_signal_FIRST'

"intermediate_event_catch_non_interrupting_signal}"       return 'intermediate_event_catch_non_interrupting_signal_END'

"{intermediate_event_catch_non_interrupting_parallel_multiple"        return 'intermediate_event_catch_non_interrupting_parallel_multiple_FIRST'

"intermediate_event_catch_non_interrupting_parallel_multiple}"        return 'intermediate_event_catch_non_interrupting_parallel_multiple_END'

"{intermediate_event_catch_non_interrupting_condition"        return 'intermediate_event_catch_non_interrupting_condition_FIRST'

"intermediate_event_catch_non_interrupting_condition}"        return 'intermediate_event_catch_non_interrupting_condition_END'

"{intermediate_event_catch_cancel"        return 'intermediate_event_catch_cancel_FIRST'

"intermediate_event_catch_cancel}"        return 'intermediate_event_catch_cancel_END'

"{ad_hoc_marker"        return 'ad_hoc_marker_FIRST'

"ad_hoc_marker}"        return 'ad_hoc_marker_END'

"{intermediate_event_catch_escalation"        return 'intermediate_event_catch_escalation_FIRST'

"intermediate_event_catch_escalation}"        return 'intermediate_event_catch_escalation_END'

"{start_event_timer"        return 'start_event_timer_FIRST'

"start_event_timer}"        return 'start_event_timer_END'

"{intermediate_event_catch_link"        return 'intermediate_event_catch_link_FIRST'

"intermediate_event_catch_link}"        return 'intermediate_event_catch_link_END'

"{start_event_multiple"       return 'start_event_multiple_FIRST'

"start_event_multiple}"       return 'start_event_multiple_END'

"{start_event_non_interrupting_multiple"        return 'start_event_non_interrupting_multiple_FIRST'

"start_event_non_interrupting_multiple}"        return 'start_event_non_interrupting_multiple_END'

"{start_event_escalation"       return 'start_event_escalation_FIRST'

"start_event_escalation}"       return 'start_event_escalation_END'

"{start_event_non_interrupting_condition"       return 'start_event_non_interrupting_condition_FIRST'

"start_event_non_interrupting_condition}"       return 'start_event_non_interrupting_condition_END'

"{script"       return 'script_FIRST'

"script}"       return 'script_END'

"{data_output"        return 'data_output_FIRST'

"data_output}"        return 'data_output_END'

"{end_event_none"       return 'end_event_none_FIRST'

"end_event_none}"       return 'end_event_none_END'

"[business_task"       return 'bussiness_task_FIRST'
"business_task]"       return 'bussiness_task_END'

"[manual_task"       return 'manual_task_FIRST'
"manual_task]"       return 'manual_task_END'

"[script_task"       return 'script_task_FIRST'
"script_task]"       return 'script_task_END'

"[send_task"       return 'send_task_FIRST'
"send_task]"       return 'send_task_END'

"[service_task"       return 'service_task_FIRST'
"service_task]"       return 'service_task_END'

"[receive_task"       return 'receive_task_FIRST'
"receive_task]"       return 'receive_task_END'

"[user_task"       return 'user_task_FIRST'
"user_task]"       return 'user_task_END'


"{x"                   return 'X_DIAMOND_START'
"x}"                   return 'X_DIAMOND_STOP'
"{send"                   return 'SENDSTART'
"send}"                   return 'SENDEND'

"(["                  return 'STADIUMSTART';
"])"                  return 'STADIUMEND';
"[["                  return 'SUBROUTINESTART';
"]]"                  return 'SUBROUTINEEND';
"[|"                  return 'VERTEX_WITH_PROPS_START';
"[("                  return 'CYLINDERSTART';
")]"                  return 'CYLINDEREND';
"((t"                 return 'TERMINATECIRCLESTART';
"t))"                 return 'TERMINATECIRCLEEND';
"((e"                 return 'ENDCIRCLESTART';
"e))"                 return 'ENDCIRCLEEND';
"((("                 return 'DOUBLECIRCLESTART';
")))"                 return 'DOUBLECIRCLEEND';
\-                    return 'MINUS';
"."                   return 'DOT';
[\_]                  return 'UNDERSCORE';
\+                    return 'PLUS';
\%                    return 'PCT';
"="                   return 'EQUALS';
\=                    return 'EQUALS';
"<"                   return 'TAGSTART';
">"                   return 'TAGEND';
"^"                   return 'UP';
"\|"                  return 'SEP';
"v"                   return 'DOWN';
[A-Za-z]+             return 'ALPHA';
"\\]"                 return 'TRAPEND';
"[/"                  return 'TRAPSTART';
"/]"                  return 'INVTRAPEND';
"[\\"                 return 'INVTRAPSTART';
[!"#$%&'*+,-.`?\\_/]  return 'PUNCTUATION';
[\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6]|
[\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377]|
[\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5]|
[\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA]|
[\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE]|
[\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA]|
[\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0]|
[\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977]|
[\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2]|
[\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A]|
[\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39]|
[\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8]|
[\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C]|
[\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C]|
[\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99]|
[\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0]|
[\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D]|
[\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3]|
[\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10]|
[\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1]|
[\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81]|
[\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3]|
[\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6]|
[\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A]|
[\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081]|
[\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D]|
[\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0]|
[\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310]|
[\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C]|
[\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711]|
[\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7]|
[\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C]|
[\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16]|
[\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF]|
[\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC]|
[\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D]|
[\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D]|
[\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3]|
[\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F]|
[\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128]|
[\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184]|
[\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3]|
[\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6]|
[\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE]|
[\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C]|
[\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D]|
[\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC]|
[\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B]|
[\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788]|
[\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805]|
[\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB]|
[\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28]|
[\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5]|
[\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4]|
[\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E]|
[\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D]|
[\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36]|
[\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D]|
[\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC]|
[\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF]|
[\uFFD2-\uFFD7\uFFDA-\uFFDC]
                      return 'UNICODE_TEXT';
"|"                   return 'PIPE';
"("                   return 'PS';
")"                   return 'PE';
"["                   return 'SQS';
"]"                   return 'SQE';
"{"                   return 'DIAMOND_START'
"}"                   return 'DIAMOND_STOP'


"\""                  return 'QUOTE';
(\r?\n)+              return 'NEWLINE';
\s                    return 'SPACE';
<<EOF>>               return 'EOF';

/lex

/* operator associations and precedence */

%left '^'

%start start

%% /* language grammar */

start
  : mermaidDoc
  | directive start
  ;

directive
  : openDirective typeDirective closeDirective separator
  | openDirective typeDirective ':' argDirective closeDirective separator
  ;

openDirective
  : open_directive { yy.parseDirective('%%{', 'open_directive'); }
  ;

typeDirective
  : type_directive { yy.parseDirective($1, 'type_directive'); }
  ;

argDirective
  : arg_directive { $1 = $1.trim().replace(/'/g, '"'); yy.parseDirective($1, 'arg_directive'); }
  ;

closeDirective
  : close_directive { yy.parseDirective('}%%', 'close_directive', 'flowchart'); }
  ;

mermaidDoc
  : graphConfig document
  ;

document
	: /* empty */
	{ $$ = [];}
	| document linee
	{
	    if(!Array.isArray($2) || $2.length > 0){
	        $1.push($2);
	    }
	    $$=$1;}
	;

linee
	: statement
	{$$=$1;}
	| SEMI
	| NEWLINE
	| SPACE
	| EOF
	;

graphConfig
    : SPACE graphConfig
    | NEWLINE graphConfig
    | GRAPH NODIR
        { yy.setDirection('LR');$$ = 'LR';}
    | GRAPH DIR FirstStmtSeperator
        { yy.setDirection($2);$$ = $2;}
    // | GRAPH SPACE TAGEND FirstStmtSeperator
    //     { yy.setDirection("LR");$$ = $3;}
    // | GRAPH SPACE TAGSTART FirstStmtSeperator
    //     { yy.setDirection("RL");$$ = $3;}
    // | GRAPH SPACE UP FirstStmtSeperator
    //     { yy.setDirection("BT");$$ = $3;}
    // | GRAPH SPACE DOWN FirstStmtSeperator
    //     { yy.setDirection("TB");$$ = $3;}
    ;

ending: endToken ending
      | endToken
      ;

endToken: NEWLINE | SPACE | EOF;

FirstStmtSeperator
    : SEMI | NEWLINE | spaceList NEWLINE ;


spaceListNewline
    : SPACE spaceListNewline
    | NEWLINE spaceListNewline
    | NEWLINE
    | SPACE
    ;


spaceList
    : SPACE spaceList
    | SPACE
    ;

statement
    : verticeStatement separator
    { /* console.warn('finat vs', $1.nodes); */ $$=$1.nodes}
    | styleStatement separator
    {$$=[];}
    | linkStyleStatement separator
    {$$=[];}
    | classDefStatement separator
    {$$=[];}
    | classStatement separator
    {$$=[];}
    | clickStatement separator
    {$$=[];}

    | pool SPACE text separator document endpool
    {$$=yy.addSubGraph($3,$5,$3, 'pool');yy.setDirection('LR');}
    // | subgraph SPACE text separator document endpool
    // {$$=yy.addSubGraph($3,$5,$3, 'pool');}

    | line SPACE text separator document endline
    {$$=yy.addSubGraph($3,$5,$3, 'subpool');yy.setDirection('LR');}

    | acc_title acc_title_value  { $$=$2.trim();yy.setAccTitle($$); }
    | acc_descr acc_descr_value  { $$=$2.trim();yy.setAccDescription($$); }
    | acc_descr_multiline_value { $$=$1.trim();yy.setAccDescription($$); }
    ;

separator: NEWLINE | SEMI | EOF ;


verticeStatement: verticeStatement link node
        { /* console.warn('vs',$1.stmt,$3); */ yy.addLink($1.stmt,$3,$2); $$ = { stmt: $3, nodes: $3.concat($1.nodes) } }
    |  verticeStatement link node spaceList
        { /* console.warn('vs',$1.stmt,$3); */ yy.addLink($1.stmt,$3,$2); $$ = { stmt: $3, nodes: $3.concat($1.nodes) } }
    |node spaceList {/*console.warn('noda', $1);*/ $$ = {stmt: $1, nodes:$1 }}
    |node { /*console.warn('noda', $1);*/ $$ = {stmt: $1, nodes:$1 }}
    ;

node: vertex
        { /* console.warn('nod', $1); */ $$ = [$1];}
    | node spaceList AMP spaceList vertex
        { $$ = $1.concat($5); /* console.warn('pip', $1[0], $5, $$); */ }
    | vertex STYLE_SEPARATOR idString
        {$$ = [$1];yy.setClass($1,$3)}
    ;

vertex:  idString SQS text SQE
        {$$ = $1;yy.addVertex($1,$3,'square');}
    | idString ENDCIRCLESTART text ENDCIRCLEEND
            {$$ = $1;yy.addVertex($1,$3,'endcircle');}
    | idString TERMINATECIRCLESTART text TERMINATECIRCLEEND
                {$$ = $1;yy.addVertex($1,$3,'terminatecircle');}
    | idString DOUBLECIRCLESTART text DOUBLECIRCLEEND
        {$$ = $1;yy.addVertex($1,$3,'doublecircle');}
    | idString PS PS text PE PE
        {$$ = $1;yy.addVertex($1,$4,'circle');}
    | idString '(-' text '-)'
        {$$ = $1;yy.addVertex($1,$3,'ellipse');}
    | idString STADIUMSTART text STADIUMEND
        {$$ = $1;yy.addVertex($1,$3,'stadium');}
    | idString SUBROUTINESTART text SUBROUTINEEND
        {$$ = $1;yy.addVertex($1,$3,'subroutine');}
    | idString VERTEX_WITH_PROPS_START ALPHA COLON ALPHA PIPE text SQE
        {$$ = $1;yy.addVertex($1,$7,'rect',undefined,undefined,undefined, Object.fromEntries([[$3, $5]]));}
    | idString CYLINDERSTART text CYLINDEREND
        {$$ = $1;yy.addVertex($1,$3,'cylinder');}
    | idString PS text PE
        {$$ = $1;yy.addVertex($1,$3,'round');}
    | idString DIAMOND_START text DIAMOND_STOP
        {$$ = $1;yy.addVertex($1,$3,'diamond');}
    | idString DIAMOND_START DIAMOND_START text DIAMOND_STOP DIAMOND_STOP
        {$$ = $1;yy.addVertex($1,$4,'x_diamond');}
    | idString X_DIAMOND_START text X_DIAMOND_STOP
        {$$ = $1;yy.addVertex($1,$3,'x_diamond');}

    | idString SENDSTART text SENDEND
            {$$ = $1;yy.addVertex($1,$3,'sende');}
    | idString end_event_compensation_FIRST text end_event_compensation_END
            {$$ = $1;yy.addVertex($1,$3,'end_event_compensation');}

    | idString end_event_cancel_FIRST text end_event_cancel_END
            {$$ = $1;yy.addVertex($1,$3,'end_event_cancel');}

    | idString lane_divide_three_FIRST text lane_divide_three_END
            {$$ = $1;yy.addVertex($1,$3,'lane_divide_three');}

    | idString intermediate_event_catch_parallel_multiple_FIRST text intermediate_event_catch_parallel_multiple_END
            {$$ = $1;yy.addVertex($1,$3,'intermediate_event_catch_parallel_multiple');}

    | idString service_FIRST text service_END
            {$$ = $1;yy.addVertex($1,$3,'service');}

    | idString end_event_signal_FIRST text end_event_signal_END
            {$$ = $1;yy.addVertex($1,$3,'end_event_signal');}

    | idString sequential_mi_marker_FIRST text sequential_mi_marker_END
            {$$ = $1;yy.addVertex($1,$3,'sequential_mi_marker');}

    | idString intermediate_event_throw_escalation_FIRST text intermediate_event_throw_escalation_END
            {$$ = $1;yy.addVertex($1,$3,'intermediate_event_throw_escalation');}

    | idString receive_FIRST text receive_END
        {$$ = $1;yy.addVertex($1, $3, 'receive');}
    | idString intermediate_event_catch_signal_FIRST text intermediate_event_catch_signal_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_signal');}
    | idString compensation_marker_FIRST text compensation_marker_END
        {$$ = $1;yy.addVertex($1, $3, 'compensation_marker');}
    | idString start_event_parallel_multiple_FIRST text start_event_parallel_multiple_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_parallel_multiple');}
    | idString intermediate_event_catch_multiple_FIRST text intermediate_event_catch_multiple_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_multiple');}
    | idString end_event_escalation_FIRST text end_event_escalation_END
        {$$ = $1;yy.addVertex($1, $3, 'end_event_escalation');}
    | idString trash_FIRST text trash_END
        {$$ = $1;yy.addVertex($1, $3, 'trash');}
    | idString start_event_non_interrupting_parallel_multiple_FIRST text start_event_non_interrupting_parallel_multiple_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_non_interrupting_parallel_multiple');}
    | idString data_object_FIRST text data_object_END
        {$$ = $1;yy.addVertex($1, $3, 'data_object');}
    | idString end_event_error_FIRST text end_event_error_END
        {$$ = $1;yy.addVertex($1, $3, 'end_event_error');}
    | idString gateway_complex_FIRST text gateway_complex_END
        {$$ = $1;yy.addVertex($1, $3, 'gateway_complex');}
    | idString intermediate_event_catch_error_FIRST text intermediate_event_catch_error_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_error');}
    | idString start_event_non_interrupting_escalation_FIRST text start_event_non_interrupting_escalation_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_non_interrupting_escalation');}
    | idString intermediate_event_throw_link_FIRST text intermediate_event_throw_link_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_throw_link');}
    | idString gateway_xor_FIRST text gateway_xor_END
        {$$ = $1;yy.addVertex($1, $3, 'gateway_xor');}
    | idString lane_insert_below_FIRST text lane_insert_below_END
        {$$ = $1;yy.addVertex($1, $3, 'lane_insert_below');}
    | idString gateway_eventbased_FIRST text gateway_eventbased_END
        {$$ = $1;yy.addVertex($1, $3, 'gateway_eventbased');}
    | idString intermediate_event_catch_non_interrupting_escalation_FIRST text intermediate_event_catch_non_interrupting_escalation_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_non_interrupting_escalation');}
    | idString send_FIRST text send_END
        {$$ = $1;yy.addVertex($1, $3, 'send');}
    | idString gateway_none_FIRST text gateway_none_END
        {$$ = $1;yy.addVertex($1, $3, 'gateway_none');}
    | idString gateway_parallel_FIRST text gateway_parallel_END
        {$$ = $1;yy.addVertex($1, $3, 'gateway_parallel');}
    | idString intermediate_event_catch_message_FIRST text intermediate_event_catch_message_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_message');}
    | idString screw_wrench_FIRST text screw_wrench_END
        {$$ = $1;yy.addVertex($1, $3, 'screw_wrench');}
    | idString end_event_multiple_FIRST text end_event_multiple_END
        {$$ = $1;yy.addVertex($1, $3, 'end_event_multiple');}
    | idString loop_marker_FIRST text loop_marker_END
        {$$ = $1;yy.addVertex($1, $3, 'loop_marker');}
    | idString end_event_link_FIRST text end_event_link_END
        {$$ = $1;yy.addVertex($1, $3, 'end_event_link');}
    | idString data_store_FIRST text data_store_END
        {$$ = $1;yy.addVertex($1, $3, 'data_store');}
    | idString start_event_condition_FIRST text start_event_condition_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_condition');}
    | idString intermediate_event_throw_multiple_FIRST text intermediate_event_throw_multiple_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_throw_multiple');}
    | idString data_input_FIRST text data_input_END
        {$$ = $1;yy.addVertex($1, $3, 'data_input');}
    | idString intermediate_event_catch_non_interrupting_message_FIRST text intermediate_event_catch_non_interrupting_message_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_non_interrupting_message');}
    | idString intermediate_event_none_FIRST text intermediate_event_none_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_none');}
    | idString intermediate_event_catch_condition_FIRST text intermediate_event_catch_condition_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_condition');}
    | idString parallel_mi_marker_FIRST text parallel_mi_marker_END
        {$$ = $1;yy.addVertex($1, $3, 'parallel_mi_marker');}
    | idString lane_insert_above_FIRST text lane_insert_above_END
        {$$ = $1;yy.addVertex($1, $3, 'lane_insert_above');}
    | idString end_event_terminate_FIRST text end_event_terminate_END
        {$$ = $1;yy.addVertex($1, $3, 'end_event_terminate');}
    | idString intermediate_event_throw_message_FIRST text intermediate_event_throw_message_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_throw_message');}
    | idString start_event_signal_FIRST text start_event_signal_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_signal');}
    | idString intermediate_event_catch_non_interrupting_multiple_FIRST text intermediate_event_catch_non_interrupting_multiple_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_non_interrupting_multiple');}
    | idString intermediate_event_catch_non_interrupting_timer_FIRST text intermediate_event_catch_non_interrupting_timer_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_non_interrupting_timer');}
    | idString intermediate_event_throw_compensation_FIRST text intermediate_event_throw_compensation_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_throw_compensation');}
    | idString manual_FIRST text manual_END
        {$$ = $1;yy.addVertex($1, $3, 'manual');}
    | idString intermediate_event_catch_compensation_FIRST text intermediate_event_catch_compensation_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_compensation');}
    | idString gateway_or_FIRST text gateway_or_END
        {$$ = $1;yy.addVertex($1, $3, 'gateway_or');}
    | idString intermediate_event_catch_timer_FIRST text intermediate_event_catch_timer_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_timer');}
    | idString start_event_none_FIRST text start_event_none_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_none');}
    | idString start_event_compensation_FIRST text start_event_compensation_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_compensation');}
    | idString start_event_non_interrupting_message_FIRST text start_event_non_interrupting_message_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_non_interrupting_message');}
    | idString lane_divide_two_FIRST text lane_divide_two_END
        {$$ = $1;yy.addVertex($1, $3, 'lane_divide_two');}
    | idString user_FIRST text user_END
        {$$ = $1;yy.addVertex($1, $3, 'user');}
    | idString intermediate_event_throw_signal_FIRST text intermediate_event_throw_signal_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_throw_signal');}
    | idString start_event_non_interrupting_signal_FIRST text start_event_non_interrupting_signal_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_non_interrupting_signal');}
    | idString start_event_message_FIRST text start_event_message_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_message');}
    | idString end_event_message_FIRST text end_event_message_END
        {$$ = $1;yy.addVertex($1, $3, 'end_event_message');}
    | idString start_event_non_interrupting_timer_FIRST text start_event_non_interrupting_timer_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_non_interrupting_timer');}
    | idString business_rule_FIRST text business_rule_END
        {$$ = $1;yy.addVertex($1, $3, 'business_rule');}
    | idString start_event_error_FIRST text start_event_error_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_error');}
    | idString hand_tool_FIRST text hand_tool_END
        {$$ = $1;yy.addVertex($1, $3, 'hand_tool');}
    | idString sub_process_marker_FIRST text sub_process_marker_END
        {$$ = $1;yy.addVertex($1, $3, 'sub_process_marker');}
    | idString intermediate_event_catch_non_interrupting_signal_FIRST text intermediate_event_catch_non_interrupting_signal_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_non_interrupting_signal');}
    | idString intermediate_event_catch_non_interrupting_parallel_multiple_FIRST text intermediate_event_catch_non_interrupting_parallel_multiple_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_non_interrupting_parallel_multiple');}
    | idString intermediate_event_catch_non_interrupting_condition_FIRST text intermediate_event_catch_non_interrupting_condition_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_non_interrupting_condition');}
    | idString intermediate_event_catch_cancel_FIRST text intermediate_event_catch_cancel_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_cancel');}
    | idString ad_hoc_marker_FIRST text ad_hoc_marker_END
        {$$ = $1;yy.addVertex($1, $3, 'ad_hoc_marker');}
    | idString intermediate_event_catch_escalation_FIRST text intermediate_event_catch_escalation_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_escalation');}
    | idString start_event_timer_FIRST text start_event_timer_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_timer');}
    | idString intermediate_event_catch_link_FIRST text intermediate_event_catch_link_END
        {$$ = $1;yy.addVertex($1, $3, 'intermediate_event_catch_link');}
    | idString start_event_multiple_FIRST text start_event_multiple_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_multiple');}
    | idString start_event_non_interrupting_multiple_FIRST text start_event_non_interrupting_multiple_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_non_interrupting_multiple');}
    | idString start_event_escalation_FIRST text start_event_escalation_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_escalation');}
    | idString start_event_non_interrupting_condition_FIRST text start_event_non_interrupting_condition_END
        {$$ = $1;yy.addVertex($1, $3, 'start_event_non_interrupting_condition');}
    | idString script_FIRST text script_END
        {$$ = $1;yy.addVertex($1, $3, 'script');}
    | idString data_output_FIRST text data_output_END
        {$$ = $1;yy.addVertex($1, $3, 'data_output');}
    | idString end_event_none_FIRST text end_event_none_END
        {$$ = $1;yy.addVertex($1, $3, 'end_event_none');}

    | idString bussiness_task_FIRST text bussiness_task_END
        {$$ = $1;yy.addVertex($1, $3, 'bussiness_task');}
    | idString manual_task_FIRST text manual_task_END
        {$$ = $1;yy.addVertex($1, $3, 'manual_task');}
    | idString script_task_FIRST text script_task_END
        {$$ = $1;yy.addVertex($1, $3, 'script_task');}
    | idString send_task_FIRST text send_task_END
        {$$ = $1;yy.addVertex($1, $3, 'send_task');}
    | idString service_task_FIRST text service_task_END
        {$$ = $1;yy.addVertex($1, $3, 'service_task');}
    | idString receive_task_FIRST text receive_task_END
        {$$ = $1;yy.addVertex($1, $3, 'receive_task');}
    | idString user_task_FIRST text user_task_END
        {$$ = $1;yy.addVertex($1, $3, 'user_task');}

    | idString TAGEND text SQE
        {$$ = $1;yy.addVertex($1,$3,'odd');}
    | idString TRAPSTART text TRAPEND
        {$$ = $1;yy.addVertex($1,$3,'trapezoid');}
    | idString INVTRAPSTART text INVTRAPEND
        {$$ = $1;yy.addVertex($1,$3,'inv_trapezoid');}
    | idString TRAPSTART text INVTRAPEND
        {$$ = $1;yy.addVertex($1,$3,'lean_right');}
    | idString INVTRAPSTART text TRAPEND
        {$$ = $1;yy.addVertex($1,$3,'lean_left');}
    | idString
        { /*console.warn('h: ', $1);*/$$ = $1;yy.addVertex($1);}
    ;



link: linkStatement arrowText
    {$1.text = $2;$$ = $1;}
    | linkStatement TESTSTR SPACE
    {$1.text = $2;$$ = $1;}
    | linkStatement arrowText SPACE
    {$1.text = $2;$$ = $1;}
    | linkStatement
    {$$ = $1;}
    | START_LINK text LINK
        {var inf = yy.destructLink($3, $1); $$ = {"type":inf.type,"stroke":inf.stroke,"length":inf.length,"text":$2};}
    ;

linkStatement: LINK
        {var inf = yy.destructLink($1);$$ = {"type":inf.type,"stroke":inf.stroke,"length":inf.length};}
        ;

arrowText:
    PIPE text PIPE
    {$$ = $2;}
    ;

text: textToken
    { $$={text:$1, type: 'text'};}
    | text textToken
    { $$={text:$1.text+''+$2, type: $1.type};}
    | STR
    { $$={text: $1, type: 'text'};}
    | MD_STR
    { $$={text: $1, type: 'markdown'};}
    ;



keywords
    : STYLE | LINKSTYLE | CLASSDEF | CLASS | CLICK | GRAPH | DIR | line | pool | endline | endpool | end | DOWN | UP;


textNoTags: textNoTagsToken
    {$$=$1;}
    | textNoTags textNoTagsToken
    {$$=$1+''+$2;}
    ;


classDefStatement:CLASSDEF SPACE DEFAULT SPACE stylesOpt
    {$$ = $1;yy.addClass($3,$5);}
    | CLASSDEF SPACE alphaNum SPACE stylesOpt
          {$$ = $1;yy.addClass($3,$5);}
    ;

classStatement:CLASS SPACE alphaNum SPACE alphaNum
    {$$ = $1;yy.setClass($3, $5);}
    ;

clickStatement
    : CLICK CALLBACKNAME                           {$$ = $1;yy.setClickEvent($1, $2);}
    | CLICK CALLBACKNAME SPACE STR                 {$$ = $1;yy.setClickEvent($1, $2);yy.setTooltip($1, $4);}
    | CLICK CALLBACKNAME CALLBACKARGS              {$$ = $1;yy.setClickEvent($1, $2, $3);}
    | CLICK CALLBACKNAME CALLBACKARGS SPACE STR    {$$ = $1;yy.setClickEvent($1, $2, $3);yy.setTooltip($1, $5);}
    | CLICK HREF                                   {$$ = $1;yy.setLink($1, $2);}
    | CLICK HREF SPACE STR                         {$$ = $1;yy.setLink($1, $2);yy.setTooltip($1, $4);}
    | CLICK HREF SPACE LINK_TARGET                 {$$ = $1;yy.setLink($1, $2, $4);}
    | CLICK HREF SPACE STR SPACE LINK_TARGET       {$$ = $1;yy.setLink($1, $2, $6);yy.setTooltip($1, $4);}
    | CLICK alphaNum                               {$$ = $1;yy.setClickEvent($1, $2);}
    | CLICK alphaNum SPACE STR                     {$$ = $1;yy.setClickEvent($1, $2);yy.setTooltip($1, $4);}
    | CLICK STR                                    {$$ = $1;yy.setLink($1, $2);}
    | CLICK STR SPACE STR                          {$$ = $1;yy.setLink($1, $2);yy.setTooltip($1, $4);}
    | CLICK STR SPACE LINK_TARGET                  {$$ = $1;yy.setLink($1, $2, $4);}
    | CLICK STR SPACE STR SPACE LINK_TARGET        {$$ = $1;yy.setLink($1, $2, $6);yy.setTooltip($1, $4);}
    ;

styleStatement:STYLE SPACE alphaNum SPACE stylesOpt
    {$$ = $1;yy.addVertex($3,undefined,undefined,$5);}
    | STYLE SPACE HEX SPACE stylesOpt
          {$$ = $1;yy.updateLink($3,$5);}
    ;

linkStyleStatement
    : LINKSTYLE SPACE DEFAULT SPACE stylesOpt
          {$$ = $1;yy.updateLink([$3],$5);}
    | LINKSTYLE SPACE numList SPACE stylesOpt
          {$$ = $1;yy.updateLink($3,$5);}
    | LINKSTYLE SPACE DEFAULT SPACE INTERPOLATE SPACE alphaNum SPACE stylesOpt
          {$$ = $1;yy.updateLinkInterpolate([$3],$7);yy.updateLink([$3],$9);}
    | LINKSTYLE SPACE numList SPACE INTERPOLATE SPACE alphaNum SPACE stylesOpt
          {$$ = $1;yy.updateLinkInterpolate($3,$7);yy.updateLink($3,$9);}
    | LINKSTYLE SPACE DEFAULT SPACE INTERPOLATE SPACE alphaNum
          {$$ = $1;yy.updateLinkInterpolate([$3],$7);}
    | LINKSTYLE SPACE numList SPACE INTERPOLATE SPACE alphaNum
          {$$ = $1;yy.updateLinkInterpolate($3,$7);}
    ;

numList: NUM
        {$$ = [$1]}
    | numList COMMA NUM
        {$1.push($3);$$ = $1;}
    ;

stylesOpt: style
        {$$ = [$1]}
    | stylesOpt COMMA style
        {$1.push($3);$$ = $1;}
    ;

style: styleComponent
    |style styleComponent
    {$$ = $1 + $2;}
    ;

styleComponent: ALPHA | COLON | MINUS | NUM | UNIT | SPACE | HEX | BRKT | DOT | STYLE | PCT ;

/* Token lists */

textToken      : textNoTagsToken | TAGSTART | TAGEND | START_LINK | PCT | DEFAULT;

textNoTagsToken: alphaNumToken | SPACE | MINUS | keywords ;

idString
    :idStringToken
    {$$=$1}
    | idString idStringToken
    {$$=$1+''+$2}
    ;

alphaNum
    : alphaNumStatement
    {$$=$1;}
    | alphaNum alphaNumStatement
    {$$=$1+''+$2;}
    ;

alphaNumStatement
    : DIR
        {$$=$1;}
    | alphaNumToken
        {$$=$1;}
    | DOWN
        {$$='v';}
    | MINUS
        {$$='-';}
    ;

direction
    : direction_tb
    { $$={stmt:'dir', value:'TB'};}
    | direction_bt
    { $$={stmt:'dir', value:'BT'};}
    | direction_rl
    { $$={stmt:'dir', value:'RL'};}
    | direction_lr
    { $$={stmt:'dir', value:'LR'};}
    ;

alphaNumToken  : PUNCTUATION | AMP | UNICODE_TEXT | NUM| ALPHA | COLON | COMMA | PLUS | EQUALS | MULT | DOT | BRKT| UNDERSCORE ;

idStringToken  : ALPHA|UNDERSCORE |UNICODE_TEXT | NUM|  COLON | COMMA | PLUS | MINUS | DOWN |EQUALS | MULT | BRKT | DOT | PUNCTUATION | AMP | DEFAULT;

graphCodeTokens: STADIUMSTART | STADIUMEND | SUBROUTINESTART | SUBROUTINEEND | VERTEX_WITH_PROPS_START | CYLINDERSTART | CYLINDEREND | TRAPSTART | TRAPEND | INVTRAPSTART | INVTRAPEND | PIPE | PS | PE | SQS | SQE | X_DIAMOND_START | X_DIAMOND_STOP
 | bussiness_task_FIRST
 | bussiness_task_END
 | manual_task_FIRST
 | manual_task_END
 | script_task_FIRST
 | script_task_END
 | send_task_FIRST
 | send_task_END
 | service_task_FIRST
 | service_task_END
 | receive_task_FIRST
 | receive_task_END
 | user_task_FIRST
 | user_task_END
 | receive_FIRST | receive_END
     | intermediate_event_catch_signal_FIRST | intermediate_event_catch_signal_END
     | compensation_marker_FIRST | compensation_marker_END
     | start_event_parallel_multiple_FIRST | start_event_parallel_multiple_END
     | intermediate_event_catch_multiple_FIRST | intermediate_event_catch_multiple_END
     | end_event_escalation_FIRST | end_event_escalation_END
     | trash_FIRST | trash_END
     | start_event_non_interrupting_parallel_multiple_FIRST | start_event_non_interrupting_parallel_multiple_END
     | data_object_FIRST | data_object_END
     | end_event_error_FIRST | end_event_error_END
     | gateway_complex_FIRST | gateway_complex_END
     | intermediate_event_catch_error_FIRST | intermediate_event_catch_error_END
     | start_event_non_interrupting_escalation_FIRST | start_event_non_interrupting_escalation_END
     | intermediate_event_throw_link_FIRST | intermediate_event_throw_link_END
     | gateway_xor_FIRST | gateway_xor_END
     | lane_insert_below_FIRST | lane_insert_below_END
     | gateway_eventbased_FIRST | gateway_eventbased_END
     | intermediate_event_catch_non_interrupting_escalation_FIRST | intermediate_event_catch_non_interrupting_escalation_END
     | send_FIRST | send_END
     | gateway_none_FIRST | gateway_none_END
     | gateway_parallel_FIRST | gateway_parallel_END
     | intermediate_event_catch_message_FIRST | intermediate_event_catch_message_END
     | screw_wrench_FIRST | screw_wrench_END
     | end_event_multiple_FIRST | end_event_multiple_END
     | loop_marker_FIRST | loop_marker_END
     | end_event_link_FIRST | end_event_link_END
     | data_store_FIRST | data_store_END
     | start_event_condition_FIRST | start_event_condition_END
     | intermediate_event_throw_multiple_FIRST | intermediate_event_throw_multiple_END
     | data_input_FIRST | data_input_END
     | intermediate_event_catch_non_interrupting_message_FIRST | intermediate_event_catch_non_interrupting_message_END
     | intermediate_event_none_FIRST | intermediate_event_none_END
     | intermediate_event_catch_condition_FIRST | intermediate_event_catch_condition_END
     | parallel_mi_marker_FIRST | parallel_mi_marker_END
     | lane_insert_above_FIRST | lane_insert_above_END
     | end_event_terminate_FIRST | end_event_terminate_END
     | intermediate_event_throw_message_FIRST | intermediate_event_throw_message_END
     | start_event_signal_FIRST | start_event_signal_END
     | intermediate_event_catch_non_interrupting_multiple_FIRST | intermediate_event_catch_non_interrupting_multiple_END
     | intermediate_event_catch_non_interrupting_timer_FIRST | intermediate_event_catch_non_interrupting_timer_END
     | intermediate_event_throw_compensation_FIRST | intermediate_event_throw_compensation_END
     | manual_FIRST | manual_END
     | intermediate_event_catch_compensation_FIRST | intermediate_event_catch_compensation_END
     | gateway_or_FIRST | gateway_or_END
     | intermediate_event_catch_timer_FIRST | intermediate_event_catch_timer_END
     | start_event_none_FIRST | start_event_none_END
     | start_event_compensation_FIRST | start_event_compensation_END
     | start_event_non_interrupting_message_FIRST | start_event_non_interrupting_message_END
     | lane_divide_two_FIRST | lane_divide_two_END
     | user_FIRST | user_END
     | intermediate_event_throw_signal_FIRST | intermediate_event_throw_signal_END
     | start_event_non_interrupting_signal_FIRST | start_event_non_interrupting_signal_END
     | start_event_message_FIRST | start_event_message_END
     | end_event_message_FIRST | end_event_message_END
     | start_event_non_interrupting_timer_FIRST | start_event_non_interrupting_timer_END
     | business_rule_FIRST | business_rule_END
     | start_event_error_FIRST | start_event_error_END
     | hand_tool_FIRST | hand_tool_END
     | sub_process_marker_FIRST | sub_process_marker_END
     | intermediate_event_catch_non_interrupting_signal_FIRST | intermediate_event_catch_non_interrupting_signal_END
     | intermediate_event_catch_non_interrupting_parallel_multiple_FIRST | intermediate_event_catch_non_interrupting_parallel_multiple_END
     | intermediate_event_catch_non_interrupting_condition_FIRST | intermediate_event_catch_non_interrupting_condition_END
     | intermediate_event_catch_cancel_FIRST | intermediate_event_catch_cancel_END
     | ad_hoc_marker_FIRST | ad_hoc_marker_END
     | intermediate_event_catch_escalation_FIRST | intermediate_event_catch_escalation_END
     | start_event_timer_FIRST | start_event_timer_END
     | intermediate_event_catch_link_FIRST | intermediate_event_catch_link_END
     | start_event_multiple_FIRST | start_event_multiple_END
     | start_event_non_interrupting_multiple_FIRST | start_event_non_interrupting_multiple_END
     | start_event_escalation_FIRST | start_event_escalation_END
     | start_event_non_interrupting_condition_FIRST | start_event_non_interrupting_condition_END
     | script_FIRST | script_END
     | data_output_FIRST | data_output_END
     | end_event_none_FIRST | end_event_none_END

 | end_event_compensation_FIRST |  end_event_compensation_END | DIAMOND_START | DIAMOND_STOP | SENDSTART | SENDEEND | SENDESTART | SENDEND | | TAGSTART | TAGEND | ARROW_CROSS | ARROW_POINT | ARROW_CIRCLE | ARROW_OPEN | QUOTE | SEMI;
%%
