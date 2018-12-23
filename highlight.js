
//Wrap selected text in  tags with the class 'hl'
//Take some action after (in this case, a simple alert)
// $("p, li").on("mouseup",
//     function() {
//         var selection = getSelectedText(); 
//         if(selection.length >= 3) {
//             console.log(selection);
//             
//             
//             var replacement = $('<span></span>').attr({'class':'hl'}).html(selection);
//             console.log(replacement);
//             
//             var replacementHtml = $('<div>').append(replacement.clone()).remove().html();
//             console.log(replacementHtml);
// 
//             $(this).html( $(this).html().replace(selection, replacementHtml) );
//             alert(selection);
//         }        
//     }
// ); 

highlight_css = document.createElement('style');
highlight_css.type = "text/css";
highlight_css.id = "highlight_css";
document.head.appendChild(highlight_css);
var css_for_hl = 'span.hl { background: yellow; }\n';
css_for_hl += '#hlmenu { position: absolute; top: 300px; left: 200px;}\n';
css_for_hl += '#hlmenu { padding: 8px; background: #FFF; }\n';
css_for_hl += '#hlmenu { box-shadow: 8px 10px 5px #888; border: 1px solid #aaa;}\n';
css_for_hl += '#hlmenu .hldelete { background: #fdd; }';
css_for_hl += '#hlmenu > div { padding: 4px; font-size: 90%}';
highlight_css.innerHTML = css_for_hl;

hlmenu = document.createElement('div');
hlmenu.id = "hlmenu";
hlmenu.style.display = "none";
hlmenu_contents = '<div class="hldelete" data-hlid="">delete highlight</div>\n';
hlmenu_contents += '<div class="dismiss">dismiss menu</div>';
hlmenu.innerHTML = hlmenu_contents;
document.body.appendChild(hlmenu);

var all_highlights = localStorage.getObject("all_highlights");
if (!all_highlights) {
    console.log("no highlights on this page",all_highlights);
     all_highlights= {};
} else {
    console.log("highlights already",all_highlights);
}

console.log("all_highlights.keys()", Object.keys(all_highlights));
display_all_highlights(all_highlights, Object.keys(all_highlights), 0);


/*
for (var key in all_highlights) {
    var this_key = key;
    var these_highlights = all_highlights[key];
    console.log("adding highlights to", key);
//    await display_highlights_on(key, all_highlights[key], 0)
    for (var i=0; i< these_highlights.length; ++i) {
        hl = these_highlights[i];
        console.log("inserting highlight",i,"which is",hl, "on", key);
    //    display_one_highlight(key, hl);
//fails because 
        setTimeout(function() { display_one_highlight(this_key, hl)}, i*2000);

    }
}
*/

function index_of_child(child) {
    var i = 0;
    while( (child = child.previousSibling) != null ) 
      {i++ }
    return i
}

function increment_id(list_of_things_with_ids) {  // assume ids are of the form xxxxNN with N a digit and x a non-digit
    if (list_of_things_with_ids.length == 0) {
        return 0
    }

    id_start = list_of_things_with_ids[0]["id"].replace(/^(.*?)[0-9]+$/, "$1");
    current_endings = [];
    for (var i=0; i < list_of_things_with_ids.length; ++i) {
        current_endings.push(list_of_things_with_ids[i]["id"].replace(/^.*?([0-9]+)$/, "$1"));
    }
    console.log("existing id endings", current_endings);
    current_max = Math.max(...current_endings);
    return id_start + (parseInt(current_max) + 1)
}

function enclosing_p_or_li(obj) {
    console.log("obj.tagName", obj.tagName, "ggg",obj);
    if (!obj) {
        console.log("problem with previous object");
        return null
    }
    else if (obj.tagName == 'P' || obj.tagName == 'LI') {
        return obj
    }
    return enclosing_p_or_li(obj.parentNode)
}

// If you just loop ofer the highlights to add them,
// you end up with a race condition because each highlight changes
// the structure of the paragraph.
async function display_one_highlight(parent_id, hl) {
            console.log("setting", hl, "on", parent_id);
            var st_node_ind = hl['start_nn'];
            var st_offset = hl['start_offset'];
            var end_node_ind = hl['end_nn'];
            var end_offset = hl['end_offset'];
            var the_parent = document.getElementById(parent_id);
            // other error checks: same parent
            if (st_offset < 0 || st_offset > the_parent.childNodes[st_node_ind].textContent.length || end_offset < 0 || end_offset > the_parent.childNodes[end_node_ind].textContent.length) {
                return
            }

            let this_range = document.createRange();
            console.log("setting this_range.setStart", the_parent.childNodes[st_node_ind], "with offset", st_offset, "out of", the_parent.childNodes[st_node_ind].textContent.length);
            this_range.setStart(the_parent.childNodes[st_node_ind], st_offset);
            this_range.setEnd(the_parent.childNodes[end_node_ind], end_offset);
            var inside_part = document.createElement("span")
            inside_part.classList.add("hl");
            inside_part.id = hl['id'];
            this_range.surroundContents(inside_part);
            return;
}

//var display_highlights_on = function(parent_id, highlights_on, ind) {
async function display_highlights_on(parent_id, highlights_on, ind) {
    console.log("display_highlights_on", parent_id, "xxxx", ind, "out of", highlights_on.length);
    if (ind < highlights_on.length) {
        console.log("about to display one highlight, number", ind, "on", parent_id);
        await display_one_highlight(parent_id, highlights_on[ind]);
        ++ind;
        await display_highlights_on(parent_id, highlights_on, ind)
    }
    return;
}

async function display_all_highlights(every_highlight, hl_p_keys, i) {
    console.log("making hl on", hl_p_keys[i]);
    if (i < hl_p_keys.length) {
        await display_highlights_on(hl_p_keys[i], every_highlight[hl_p_keys[i]], 0);
        ++i;
        await display_all_highlights(every_highlight, hl_p_keys, i)
    }
    return;
}


$("p[id], li[id]").on("mouseup",
  function() {
    var this_selection = window.getSelection();
    console.log("selection", this_selection, "as string", this_selection.toString(), "length", this_selection.toString().length);
      if(this_selection.toString().length >= 3) {
        console.log("this_selection", this_selection);
        console.log("this_selection parentNode", this_selection.parentNode);

        num_selected_ranges = this_selection.rangeCount;
        console.log("this_selection.rangeCount", this_selection.rangeCount);
        console.log("this_selection.getRangeAt(0)", this_selection.getRangeAt(0));
        console.log("this_selection.getRangeAt(num_selected_ranges)", this_selection.getRangeAt(num_selected_ranges-1));
        console.log("this_selection.getRangeAt(0).startContainer", this_selection.getRangeAt(0).startContainer);
        console.log("this_selection.getRangeAt(0).endContainer", this_selection.getRangeAt(0).endContainer);
        console.log("this_selection.getRangeAt(-1).startContainer", this_selection.getRangeAt(num_selected_ranges-1).startContainer);
        console.log("this_selection.getRangeAt(-1).endContainer", this_selection.getRangeAt(num_selected_ranges-1).endContainer);
        console.log("start equals end", this_selection.getRangeAt(0).startContainer == this_selection.getRangeAt(0).endContainer);
        console.log("this_selection.getRangeAt(0).startContainer.parent", this_selection.getRangeAt(0).startContainer.parentNode);
        console.log("this_selection.getRangeAt(0).endContainer.parent", this_selection.getRangeAt(0).endContainer.parentNode);
        starting_parent = enclosing_p_or_li(this_selection.getRangeAt(0).startContainer);
        starting_parent_id = starting_parent.id;
        ending_parent_id = enclosing_p_or_li(this_selection.getRangeAt(num_selected_ranges-1).endContainer).id;
        console.log("starting parent", enclosing_p_or_li(this_selection.getRangeAt(0).startContainer));
        console.log("starting_parent.childNodes", starting_parent.childNodes);
        console.log("starting_parent.childNodes.length", starting_parent.childNodes.length);
        console.log("ending parent", enclosing_p_or_li(this_selection.getRangeAt(0).endContainer));
        console.log("index of starting node", index_of_child(this_selection.getRangeAt(0).startContainer));
        console.log("which is", starting_parent.childNodes[index_of_child(this_selection.getRangeAt(0).startContainer)]);
        console.log("index of ending node", index_of_child(this_selection.getRangeAt(num_selected_ranges-1).endContainer));
        console.log("which is", starting_parent.childNodes[index_of_child(this_selection.getRangeAt(num_selected_ranges-1).endContainer)]);
        console.log("XXXXXXXXXXXXXXXXXXXXXXX");
        starting_node = this_selection.getRangeAt(0);
        starting_node_container = starting_node.startContainer;
        starting_node_number = index_of_child(starting_node_container);
        starting_node_offset = starting_node.startOffset;
        console.log("starting_node", starting_node, "starting_node_container", starting_node_container);
        console.log("starting_parent.childNodes[0]", starting_parent.childNodes[0]);
        ending_node = this_selection.getRangeAt(num_selected_ranges-1);
        ending_node_container = ending_node.endContainer;
        ending_node_number = index_of_child(ending_node_container);
        ending_node_offset = ending_node.endOffset;
        console.log("selection starts at character number", starting_node.startOffset, "in node number", index_of_child(starting_node), "of node", starting_node.startContainer, "within", starting_node.startContainer.parentNode,"which is", starting_node);
        console.log("selection ends at character number", ending_node.endOffset, "in node number", index_of_child(ending_node_container), "of node", ending_node.endContainer, "within", ending_node.endContainer.parentNode, "which is", ending_node);

//        let this_range = document.createRange();
//        this_range.setStart(starting_parent.childNodes[starting_node_number], starting_node_offset);
//        this_range.setEnd(document.getElementById(starting_parent_id).childNodes[ending_node_number], ending_node_offset);
//        test_inside_part=document.createElement("span")
//        test_inside_part.classList.add("gggg");
//        this_range.surroundContents(test_inside_part);
        console.log("num_selected_ranges", num_selected_ranges, "starting_parent_id", starting_parent_id, "ending_parent_id", ending_parent_id);
        this_selection.empty();
        console.log("starting_parent_id", starting_parent_id, "ending_parent_id", ending_parent_id);
        if (starting_parent_id != ending_parent_id) {
            alert("Highlights must be within\none paragraph or list item.");
            return ""
        }
        if (starting_parent != starting_node_container.parentNode) {
            starting_node_number = index_of_child(starting_node_container.parentNode) - 1;
            console.log("new starting node",starting_node_number, " which is", starting_parent.childNodes[starting_node_number]);
            starting_node_offset = starting_parent.childNodes[starting_node_number].length;
        }
        if (starting_parent != ending_node_container.parentNode) {
            ending_node_number = index_of_child(ending_node_container.parentNode) + 1;
            console.log("new edngin node",ending_node_number, " which is", starting_parent.childNodes[ending_node_number]);
            ending_node_offset = 0;
        }
        console.log("starting_parent eq st cont parent", starting_parent == starting_node_container.parentNode, "starting_parent eq end cont parent", starting_parent == ending_node_container.parentNode);
//        display_one_highlight(starting_parent_id, starting_node_number, starting_node_offset, ending_node_number, ending_node_offset);
//        console.log("this_range", this_range);
        this_highlight = {"start_nn": starting_node_number,
                          "start_offset": starting_node_offset,
                          "end_nn": ending_node_number,
                          "end_offset": ending_node_offset};
        if (starting_parent_id in all_highlights) {
            new_id = increment_id(all_highlights[starting_parent_id]);
            this_highlight['id'] = new_id;
            all_highlights[starting_parent_id].push(this_highlight)
        } else {
            this_highlight['id'] = starting_parent_id + "-" + "hl" + 1;
            all_highlights[starting_parent_id] = [this_highlight]
        }
        display_one_highlight(starting_parent_id, this_highlight);
        localStorage.setObject("all_highlights", all_highlights);
        console.log("all_highlights", all_highlights);
        return "";

//        return window.getSelection().toString(); 
    } 
}); 


/*
$('body').on('mouseover','.rq_answer', function(){
  $(this).children().last().removeClass("hidecontrols");
  $(this).attr('z-index', '2000');
});
$('body').on('mouseleave','.rq_answer', function(){
  $(this).children().last().addClass("hidecontrols");
  $(this).attr('z-index', '');
});
*/

$('body').on('click','.hl', function(e){  // id on a highlight looks like parentid-hlN with N=1,2,3,...,9
  console.log("clicked hl", this.id);


  var x = e.clientX, y = e.clientY;
  console.log("x", x, "y", y);
  document.getElementById("hlmenu").style.top = (y - 10 + $(window).scrollTop()) + 'px';
  document.getElementById("hlmenu").style.left = (x + 20) + 'px';
  document.getElementById("hlmenu").style.display = 'block';
  document.getElementsByClassName("hldelete")[0].setAttribute("data-hlid", this.id);
//  tooltipSpan.style.left = (x + 20) + 'px';

  var parent_id = this.id.replace(/^(.*)-[^\-]*$/, "$1");
  var number_of_this_highlight = this.id.slice(-1);
  var these_highlights = all_highlights[parent_id];
  var this_highlight = these_highlights[number_of_this_highlight-1];
  console.log("parent id", parent_id, "nunber",number_of_this_highlight);
  var num_child_nodes = this.childNodes.length;
  console.log("which has", this.childNodes.length, "child nodes");
  for (var i=0; i < num_child_nodes; ++i) {
      console.log(i, "node is", this.childNodes[i])
  }
  console.log("highlights on this item",all_highlights[parent_id], "of which we clicked", these_highlights[number_of_this_highlight - 1],
"number", number_of_this_highlight, "out of", these_highlights.length );
  for (var i=0; i<these_highlights.length; ++i) {
      console.log("highilght", i, "is", these_highlights[i])
  }
  console.log("this one starts at", this_highlight["start_nn"], "and ends at", this_highlight["end_nn"]);
  console.log("$(this)", $(this)); 
  console.log("$(this).contents", $(this).text()); 
  console.log("this.innerHTML", this.innerHTML);
//  $(this).removeClass("hl");
  if (this.childNodes.length == 1) {   //highlight contains only text
      if (this.previousSibling.nodeType == 3 && this.nextSibling.nodeType == 3) {  // prev and next are also text
          console.log("this", this, "this.previousSibling", this.previousSibling, "type", this.previousSibling.nodeType);
      }
  }






//  $(this).replaceWith(this.innerHTML);
//  document.getElementById(parent_id).normalize();  // because a previous step creates adjacent text nodes

});

$('body').on('click','.hldelete', function(e){

    var hl_to_del_id = this.getAttribute("data-hlid");
    console.log("going to delete", hl_to_del_id);
    hl_to_delete = document.getElementById(hl_to_del_id);
    var parent_id = hl_to_del_id.replace(/^(.*)-[^\-]*$/, "$1");
    var the_parent = document.getElementById(parent_id);

    //and then update the stored highlights
    //this is complicated, because highlights are described in terms of the structure
    //of the paragrpah, which depends on which highlights already xist
    //So first we determine the order in which the highlights appear
    //(and find out how many nodes are being deleted)
    var sibling_nodes = the_parent.childNodes;
    var node_counter = {};
    var additional_offset, node_increment;
    var node_ct = 0;
    for (var i=0; i < sibling_nodes.length; ++i) {
        if (sibling_nodes[i].id) {
            node_counter[sibling_nodes[i].id] = node_ct;
            node_ct += 1;
        }
        if (sibling_nodes[i].id == hl_to_del_id) {
            node_increment = sibling_nodes[i].childNodes.length - 1
        }
    }
    console.log("node_increment", node_increment);
    console.log("node_counter", node_counter);
    console.log("deleting node", node_counter[hl_to_del_id]);
    //find out the offset of the node to be deleted
    console.log("all_highlights[parent_id]", all_highlights[parent_id]);
    for (var i=0; i < all_highlights[parent_id].length; ++i) {
        var one_highlight = all_highlights[parent_id][i];
        console.log("checking one_highlight", one_highlight);
        if (node_counter[one_highlight['id']] == node_counter[hl_to_del_id]) {
            additional_offset = one_highlight['end_offset'];
            the_hl_to_delete = all_highlights[parent_id][i];
        }
    }
    console.log("the_hl_to_delete", the_hl_to_delete);
    console.log("additional_offset", additional_offset);
    //then we re-make the list of highlights of this parent
    //go through the highlights, adjusting those which we added after the
    //lh being deleted, and whcich also occurs later in the text.
    //Note: this is only for the case if pure text paragraphs
    var new_highlights = [];
    var previous_highlight;
    var past_this_hl = false;
    for (var i=0; i < all_highlights[parent_id].length; ++i) {
        var one_highlight = all_highlights[parent_id][i];
        console.log("again checking one_highlight", one_highlight);
        console.log("x",one_highlight["start_nn"], "y", the_hl_to_delete["end_nn"], "z", the_hl_to_delete["end_nn"] + additional_offset);
        if (!past_this_hl) {
            if (one_highlight["id"] == hl_to_del_id) {
                console.log("found it", one_highlight);
                past_this_hl = true
            } else {
                new_highlights.push(one_highlight)
            }
        } else {  // hl occurs after, but maybe not physically after
            if (node_counter[one_highlight["id"]] < node_counter[hl_to_del_id]) {
                new_highlights.push(one_highlight)
            } else if (node_counter[one_highlight["id"]] == node_counter[hl_to_del_id]) {
                console.log("ERROR, we shoudl be past this point!");
                continue
            } else if (one_highlight["start_nn"] == the_hl_to_delete["end_nn"] + 2){
                console.log("offset match with", one_highlight);
                previous_highlight = one_highlight;
                previous_highlight['start_nn'] += -2 + node_increment;
                previous_highlight['end_nn'] += -2 + node_increment;
                previous_highlight['start_offset'] += additional_offset;
                previous_highlight['end_offset'] += additional_offset;
                new_highlights.push(previous_highlight);
            } else {
                console.log("apparently a far away match", one_highlight);
                previous_highlight = one_highlight;
                previous_highlight['start_nn'] += -2 + node_increment;
                previous_highlight['end_nn'] += -2 + node_increment;
                new_highlights.push(previous_highlight);
            }
        }
    }
    all_highlights[parent_id] = new_highlights;
    
    localStorage.setObject("all_highlights", all_highlights);


    // hide the current highlight
    $(hl_to_delete).replaceWith(hl_to_delete.innerHTML);

    document.getElementById(parent_id).normalize();  // because a previous step creates adjacent text nodes

    document.getElementById("hlmenu").style.display = 'none';
});

$('body').on('click','.dismiss', function(e){
    console.log(".dismiss of",this);
    the_parent = this.closest("[id]");
    the_parent.style.display = 'none';
});