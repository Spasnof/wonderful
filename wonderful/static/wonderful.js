 var nodes = null;
  var edges = null;
  var network = null;
  var seed = 2;


  function destroy() {
    if (network !== null) {
      network.destroy();
      network = null;
    }
    }

  function draw() {
    destroy();
    /* create an array with nodes from backend */
    nodes = new vis.DataSet([
      {% for table in tables %}
        {id: {{table.id}}, label: '{{ table.object | safe }}', title: '{{table.description|tojson}}' },
      {% endfor %}
      ]);
    /* create an array with edges from backend */
    edges = new vis.DataSet([
      {% for edge in edges %}
        {id: {{edge.id}}, from: {{edge.from_table_id}}, to: '{{ edge.to_table_id}}', title: '{{ edge.description|tojson}}', arrows:'to' },
      {% endfor %}
      ]);
  
  // create a network
  var container = document.getElementById('mynetwork');
  var data = {
    nodes: nodes,
    edges: edges
    };
  var options = {
    physics:{
      enabled: false
      },
    edges:{
      arrows: {
        to: {enabled: true}
      }
      },
    layout: {
      randomSeed: 2,
      // hierarchical: {
      //   enabled: true,
      //   direction: "LR",
      //   sortMethod: 'directed',
      //   nodeSpacing: 50
      // }
      },
    interaction:{
      keyboard: {
        //keyboard interrupts with text editing so just disabling.
        enabled: false },
      navigationButtons: false,
      hover:true 
      },
    manipulation: {
      deleteNode: function (data, callback) {
        saveNodeDelete(data, callback);
        },
      deleteEdge: function (data, callback) {
        saveEdgeDelete(data, callback);
        },
      addNode: function (data, callback) {
        // filling in the popup DOM elements
        document.getElementById('operation').innerHTML = "Add Node";
        document.getElementById('node-label').value = data.label;
        document.getElementById('node-id').value = generate_node_id();
        document.getElementById('saveButton').onclick = saveEdgeNew.bind(this, data, callback);
        document.getElementById('cancelButton').onclick = clearPopUp.bind();
        document.getElementById('network-popUp').style.display = 'block';
        },
      editNode: function (data, callback) {
        // filling in the popup DOM elements
        document.getElementById('operation').innerHTML = "Edit Node";
        document.getElementById('node-id').value = data.id;
        document.getElementById('node-label').value = data.label;
        document.getElementById('saveButton').onclick = saveNodeUpdate.bind(this, data, callback);
        document.getElementById('cancelButton').onclick = cancelEdit.bind(this,callback);
        document.getElementById('network-popUp').style.display = 'block';
        },
      addEdge: function (data, callback) {
        if (data.from == data.to) {
          var r = confirm("Do you want to connect the node to itself?");
          if (r == true) {
            // FIXME [warning] this is considered a syncronous main method which throws warnings. Try and have it not do that.
            generate_edge_id(data.from, data.to);
            callback(data);
            }
          } 
        else {
          // FIXME [warning] this is considered a syncronous main method which throws warnings. Try and have it not do that.
          generate_edge_id(data.from, data.to);
          callback(data);
          }
        },
      editEdge: function (data, callback){
        

        saveEdgeUpdate(data,callback);
        }
      }
    };

  network = new vis.Network(container, data, options);

  }

  function generate_node_id(){
    var strUrl = $SCRIPT_ROOT + '/_add_node'
    var strReturn = "";
 
    jQuery.ajax({
      url: strUrl,
      success: function(html) {
        strReturn = html;
      },
      async:false
    });
    return strReturn;
  }

  function generate_edge_id(from_id, to_id){
    var strUrl = $SCRIPT_ROOT + '/_add_edge'
    var strReturn = "";

    jQuery.ajax({
      url: strUrl,
      data: $.param( {
        from_id: from_id,
        to_id: to_id,
        edge_description: ''
        } ),
      success: function(html) {
        strReturn = html;
      },
      async:false
    });

    return strReturn;
  }



   function clearPopUp() {
      document.getElementById('saveButton').onclick = null;
      document.getElementById('cancelButton').onclick = null;
      document.getElementById('network-popUp').style.display = 'none';
    }

    function cancelEdit(callback) {
      clearPopUp();
      callback(null);
    }
    function update_edge(edge_id, from_id, to_id, edge_description, edge_visible){
    var strUrl = $SCRIPT_ROOT + '/_update_edge';
      if (edge_description == undefined)
      {
        edge_description = ''
      }

    jQuery.getJSON(strUrl, {
      edge_id: edge_id,
      from_id: from_id,
      to_id: to_id,
      edge_description: edge_description,
      edge_visible: edge_visible
    });
   }

    function saveEdgeDelete(data,callback) {
      data.id = network.getSelection().edges[0];
      data.from = edges.get(data.id).from;
      data.to = edges.get(data.id).to;
      data.title = edges.get(data.id).title;
      update_edge(data.id, data.from, data.to, data.title ,'0');
      callback(data);
    } 

    function saveEdgeUpdate(data,callback) {
      data.title = edges.get(data.id).title;
      update_edge(data.id, data.from, data.to, data.title ,'1');
      callback(data);
    } 

    function update_node(node_id, node_label, node_description, node_visible){
      var strUrl = $SCRIPT_ROOT + '/_update_node';
      if (node_description == undefined)
      {
        node_description = ''
      }

      return jQuery.getJSON(strUrl, {
        node_id: node_id,
        node_label: node_label,
        node_description: node_description,
        node_visible: node_visible
      });
    }   

    function saveEdgeNew(data,callback) {
      // TODO combine saveEdgeNew, saveNodeUpdate, and saveNodeDelete as one function.
      data.id = document.getElementById('node-id').value;
      data.label = document.getElementById('node-label').value;
      clearPopUp();
      update_node(data.id, data.label, undefined ,'1');
      callback(data);
    }

    function saveNodeUpdate(data,callback) {
      data.id = document.getElementById('node-id').value;
      data.label = document.getElementById('node-label').value;
      data.description = simplemde.value();
      clearPopUp();
      update_node(data.id, data.label, data.description ,'1');
      callback(data);
    }

    function saveNodeDelete(data,callback) {
      data.id = network.getSelection().nodes[0];
      data.label = nodes.get(data.id).label;
      data.description = nodes.get(data.id).description;
      update_node(data.id, data.label, data.description ,'0');
      callback(data);
    } 

    function get_child_parent_edges(node_id) {
      var strUrl = $SCRIPT_ROOT + '/_get_child_parent_edges';
      var connected_node_ids = network.getConnectedNodes(node_id);

      function encodeQueryData(data) {
       let ret = [];
       for (let d in data)
         ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
       return ret.join('&');
      }



      request = new XMLHttpRequest();
      request.onreadystatechange = function(){
        // Process the server response here.
        // console.log(request.readyState)
        if (request.readyState === XMLHttpRequest.DONE) {
          requestParsed = JSON.parse(request.response)
          for (i in requestParsed) {
            nodes.add(requestParsed[i]);
            network.setOptions({physics: { enabled : true }});
            network.on("stabilized", function (params) {
              console.log("stabilized!", params);
              network.setOptions({physics: { enabled : false }});
            });
          }
        } else {
            // Not ready yet.
        }
      };

      var url = strUrl + '?' + encodeQueryData({
        node_id: node_id,
        connected_node_ids : JSON.stringify(connected_node_ids)
      });

      request.open('GET',url)
      request.send();
    }




    function init() {
      draw();
      //function that populates the metadata details.
      network.on("click", function (params) {
        params.event = "[original event]";
        node = nodes.get(params.nodes)[0];
        edge = edges._data[params.edges[0]];
        if (node) {
            // document.getElementById('details').innerHTML = '' + node.title ;
            document.getElementById('details_id').innerHTML = params.nodes[0] ;
            simplemde.value('' + node.title );
            get_child_parent_edges(params.nodes[0]);
          }
          else if (edge) {
            // document.getElementById('details').innerHTML = '' + edge.title ;
            document.getElementById('details_id').innerHTML = params.edges[0] ;
            simplemde.value('' + edge.title );
          }
          else {
            // document.getElementById('details').innerHTML = '<p>Select a node for more details</p>'
            document.getElementById('details_id').innerHTML = '';
            simplemde.value('Select a node for more details');
          }
      });
    }

    function update_children(stack_level, next_nodes){
      // if first in stack color and move onto next nodes
      if (stack_level == 1) {
          selected = network.getSelection().nodes[0];
          console.log("init on:" + selected);
          nodes.update({id:selected, color:'#7BE141'});
          nn = network.getConnectedNodes(selected,"to");
          update_children(stack_level +1, nn);
  
        }
        else {
          console.log("level:" + stack_level);
          console.log("iterating through:" + next_nodes);
          for (n in next_nodes) {
            selected = next_nodes[n]
            console.log("next on:" + selected);
            nodes.update({id:selected, color:'#7BE141'});
            nn = network.getConnectedNodes(selected,"to");
            update_children(stack_level +1, nn);
          }
        }
    }

  $SCRIPT_ROOT = {{ request.script_root|tojson|safe }};

      // FIXME TODO this only saves backend state and not frontend state.
    // jquery command to send request to server to save node state
  $(function() {
    $('#update_details').bind('click', function() {
      $.getJSON($SCRIPT_ROOT + '/_update_node', {
        node_id: JSON.stringify(network.getSelection().nodes[0]),
        node_description: simplemde.value(),
        node_label: nodes.get(network.getSelection().nodes[0]).label,
        node_visible: "1"
      }, function(data) {
        $("#result").text(data.result);
      });
      return false;
    });
  });

  var simplemde = new SimpleMDE({ element: document.getElementById("details") });
