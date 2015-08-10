

$(function () {
  //alert("The Page Has Loaded!");
}); 

var GraphInfo = function(nodes, edges, generations)
{
    this.nodes = nodes
    this.edges = edges
    this.generations = generations
}

var Generation = function(varName, value, offset)
{
    this.value = value
    this.offset = offset
    this.varName = varName
};
var Node = function(varName, gen, x, y, z)
{
    this.generation = gen
    this.varName = varName
    this.xLoc = x
    this.yLoc = y
    this.zLoc = z
};
var Edge = function(varName, start, end, start_size, end_size)
{
    this.startnode = start
    this.endnode = end
    this.startsize = start_size
    this.endsize = end_size
    this.varName = varName
};

var Migration = function(varName, start, end, adMixSize){
    this.startnode = start;
    this.endnode = end;
    this.adMixSize = adMixSize;
    this.varName = varName
};

function parseSize(size_format){
    var start = size_format.indexOf("(") + 1;
    var end = size_format.indexOf(",");

    // Changes end position if size is of format 'size(#)' 'not size(#, #)'
    if (size_format.includes(',') === false) {
        end = size_format.indexOf(")"); 
    }

    size = size_format.substring(start,end);
    return size;
}

//parses Edge Object 
function parseEdge(varName, args)
{
    // Check if nodes of edge exist. If not, add them 
    if (nodes[args[0]] === undefined){
        nodes[args[0]] = new Node(args[0], "G0", 450, 40, 0);
    }
    if (nodes[args[1]] === undefined){
        nodes[args[1]] = new Node(args[1], "G0", 400, 40, 0);
    }

    // Migration
    if (args.length === 3){
        var n1 = nodes[args[0]]
        var n2 = nodes[args[1]]
        var adMixSize = parseFloat(parseSize(args[2]));
        return new Migration(varName, n1, n2, adMixSize);  
    }

    // Edge
    if (args.length === 4){
        var n1 = nodes[args[0]]
        var n2 = nodes[args[1]]
        var s1 = parseFloat(parseSize(args[2]));
        var s2 = parseFloat(parseSize(args[3]));
        return new Edge(varName, n1, n2, s1, s2)       
    }
}

var node_xPos = 0;
function parseNode(varName, args)
{
    if (args.length === 4)
    {
        var g = generations[args[0]]
        var x = args[1]
        var y = args[2]
        var z = args[3]
        return new Node(varName, g, x, y, z);
    }

    // MAKING UP DATA - TODO - Add real data
    else {
        var g = generations[args[0]];

        // MAKING UP DATA
        node_xPos += 150 
        var x = node_xPos;
        var y = ((node_xPos%300)/150) * 300 + 300;
        var z = 20;

        // console.log("x: " + x + "; y: " + y + "; z: " + z);
        return new Node(varName, g, x, y, z);
    }
}

function parseGen(varName, args)
{
    return new Generation(varName, parseFloat(args[0]), parseFloat(args[1]));
}

//Gets arguements for each line in the input file
function checkParenthesesAndGetArguments(command){
    //depth of parens
    var p = 0
    //pointer to argument start 
    var current = 0
    //contains list of args 
    var args = []
    //for the entire command 
    for (var i = 0; i < command.length; i++)
    {
        //if at (
        if (command[i] === "(")
        {
            //increment paren level
            p += 1
            //if open paren, set command start 
            if (p === 1)
            {
                //current is the position after paren
                current = i + 1
            }
        }
        //if at )
        else if (command[i] === ")")
        {
            //decrement paren level
            p -= 1
            //if closing paren
            if (p === 0)
            {
                //add everything inside paren into "args"
                args.push(command.substring(current, i))
            }
        }
        //if at ","
        else if (command[i] === "," && p === 1)
        {
            //if comma at level 1, its an argument 
            args.push(command.substring(current, i));
            //current is pos after comma 
            current = i + 1;
        }
    }
    if (p != 0)
    {
        alert("bad file format")
    }
    //return args of parsed commands,
    //for example, given edge(n1, n2, 100, 200) 
    //then args = [n1, n2, 100, 200]

    return args
}

$(document).on("ready", function(){
    var file_stuff = ""
    var filecon;
    var listNodes = [];
    nodesListIndex = 0;

    $("#filename").change(function(evt)
    {
        var ext = $("input#filename").val().split(".").pop().toLowerCase();
        var files = evt.target.files; // FileList Object
        
        // If there is a FileList Object present
        if (files != undefined){
            var reader = new FileReader();
            reader.onload = function (evt){
                var field = document.getElementById('main');                        
                field.innerHTML = evt.target.result;   

                var line = evt.target.result.split("\n");
                var test = false;
                for (var i = 0; i < line.length; i++)
                {
                    file_stuff += line[i]
                    if (line != "") {
                        var str = line[i].replace(/\s/g, '');
                        if (str.indexOf("#") != -1){
                            str = str.substring(0, str.indexOf("#"))
                        }
                        var command = str.substring(0, str.indexOf(";"))
                        if (command != ""){
                            var args = checkParenthesesAndGetArguments(command)
                            var isVar = command.split("=")
                            var varName = isVar[0]
                            command = isVar[1]

                            if (command == undefined){
                                /*
                                TODO - Handle last 4 lines
                                edge(nodeSplitAfEU, nodeAncestralAll, size(100000,1), ancestralSize);
                                edge(nodeAncestralAll, node(Ginf), ancestralSize);
                                rateAf-AA=rate(0.001,1);
                                migration(EuropeansPostAdmixture, AfricansPostAdmixture, rateAf-AA );
                                */
                            }

                            else if (command.startsWith("gen(")){
                                var g = parseGen(varName, args)
                                generations[varName] = g
                            }
                            else if (command.startsWith("node(")){
                                var n = parseNode(varName, args)
                                nodes[varName] = n
                            }
                            else if (command.startsWith("edge(")){
                                var e = parseEdge(varName, args)
                                edges[varName] = e
                            }
                        }
                    }
                }
                // console.log(edges);
                graph(nodes, edges, generations);
            };                  
            reader.readAsText(files[0]); 

        }
        // return false;
    });
});
      
function makeNodeLabel(node){
    var new_Node_label = labels.append("text").text(node.varName);
    new_Node_label.attr("y", node.yLoc)
                .attr("x", node.xLoc)
                .style("fill", "red");
}

function makeEdgeLabel(edge){
    var startNode = edge.startnode
    var endNode = edge.endnode

    var new_Edge_label = labels.append("text").text(edge.varName);
    new_Edge_label.attr("y", (startNode.yLoc + endNode.yLoc)/2)
                .attr("x", (startNode.xLoc + endNode.xLoc)/2)
                .style("fill", "green");   
}

function graph(nodes, edges, generations){
    for (node in nodes){
        var new_node = populationGroup.append("circle")
                .attr("cx", nodes[node].xLoc)
                .attr("cy", nodes[node].yLoc)
                .attr("r", 20) // TODO - Change Size Parameters
                .style("fill", "green")

                //Adding the mouseOver function - Hover to highlight
                .on("mouseover", function(d) {
                    var xPosition = parseFloat(d3.select(this).attr("cx"));
                    var yPosition = parseFloat(d3.select(this).attr("cy"));

                    d3.select("#tooltip")
                        .style("left", xPosition + "px")
                        .style("top", yPosition - 80+ "px")
                        .select("#value")
                        .text("population");

                    d3.select("#tooltip").classed("hidden", false);
                })

                .on("mouseout", function() {
                    d3.select("#tooltip").classed("hidden", true);
                })
        additions.Nodes += nodes[node].varName + "; "
        makeNodeLabel(nodes[node]);
    }


    for (edge in edges){
        var startNode = edges[edge].startnode
        var endNode = edges[edge].endnode

        var edge_info = {"x1": startNode.xLoc, "x2": endNode.xLoc, 
                        "y1": startNode.yLoc, "y2": endNode.yLoc};

        var edge_line = svgContainer.append("line")
            .attr("x1", startNode.xLoc)
            .attr("x2", endNode.xLoc)
            .attr("y1", startNode.yLoc)
            .attr("y2", endNode.yLoc)
            .attr("stroke-width", 2)
            .attr("stroke", "black")

        additions.Edges += startNode.varName + "to" + endNode.varName + " = edge(" + startNode.varName + ", " + endNode.varName  + ")\n";
        makeEdgeLabel(edges[edge])
    }
}