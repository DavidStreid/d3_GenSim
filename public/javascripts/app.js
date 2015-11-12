$(function () {
  //alert("The Page Has Loaded!");
}); 

// Initialize variables that keep track of graph objects
// Gets initialized with a count of 1
var GraphInfo = function(nodes, edges, generations){
    this.nodes = nodes
    this.edges = edges
    this.generations = generations
    };
var Generation = function(varName, value, offset){
    /*
    count - number of nodes in that generation
    sizing_count - used for spacing
    */
    this.value = value
    this.offset = offset
    this.varName = varName
    this.count = 0
    this.sizing_count = 0

    this.populations = []
};
var Node = function(varName, gen, x, y, node_size, g_yAxis){
    this.generation = gen
    this.varName = varName
    this.xLoc = x
    this.yLoc = y
    this.node_size = node_size
    this.gen_yAxis = g_yAxis
    this.gen_xAxis = 0

    this.ancestor_relations = []
    this.descent_relations = []
};


var Edge = function(varName, start, end, start_size, end_size){
    this.startnode = start
    this.endnode = end
    this.startsize = start_size
    this.endsize = end_size
    this.varName = varName};
var Migration = function(varName, start, end, adMixSize){
    this.startnode = start;
    this.endnode = end;
    this.adMixSize = adMixSize;
    this.varName = varName};

function parseSize(size_format){
    var start = size_format.indexOf("(") + 1;
    var end = size_format.indexOf(",");

    // Changes end position if size is of format 'size(#)' 'not size(#, #)'
    if (size_format.includes(',') === false) {
        end = size_format.indexOf(")"); 
    }

    size = size_format.substring(start,end);
    return size;
    };

//parses Edge Object 
/*
    Input - variableName and parameters in parentheses
        E.g. varName = "admixtureGeneration"; ["15", "2"]
*/
function parseEdge(varName, args){
    // Check if nodes of edge exist. If not, add them along with the generation they belong to
    if (nodes[args[0]] === undefined){
        generations['g0'] = parseGen(args[0], [0, 0])
        nodes[args[0]] = new Node('g0', "g0", 450, 40, 0);
        generations['g0'].count += 1
        generations['g0'].sizing_count = generations['g0'].count
    }
    if (nodes[args[1]] === undefined){
        generations['g0'] = parseGen(args[0], [0, 0])
        nodes[args[1]] = new Node('g0', "g0", 400, 40, 0);
        generations['g0'].count += 1
        generations['g0'].sizing_count = generations[args].count
    }

    // Migration - migrationBranchEU = edge(nodeAA, nodeEuToAA, size(2000,2))
    if (args.length === 3){
        var n1 = nodes[args[0]]
        var n2 = nodes[args[1]]
        var adMixSize = parseFloat(parseSize(args[2]));
        return new Migration(varName, n1, n2, adMixSize);  
    }

    // Edge - EuropeansPostAdmixture = edge(node(G0), nodeEuToAA, size(1000000), size(98000,1))
    if (args.length === 4){
        var n1 = nodes[args[0]]
        var n2 = nodes[args[1]]
        var s1 = parseFloat(parseSize(args[2]));
        var s2 = parseFloat(parseSize(args[3]));
        return new Edge(varName, n1, n2, s1, s2)       
    }}

var last_gen = "";
var node_yPos = 0;

/*
    E.g. varName = "nodeEuToAA"; args = ["admixtureGeneration"]
    gen_xAxis cannot be determined because number of nodes
    in generation is not yet determined at time of node parsing
*/

function parseNode(varName, args){
    // Find the maximum x and y values
    if (typeof(parseNode.maxY) == 'undefined'){
        parseNode.maxY = args[1]
    }
    else {
        if (args[1] > parseNode.maxY){
            parseNode.maxY = args[1]
        }
    }
    if (typeof(parseNode.minY) == 'undefined'){
        parseNode.minY = args[1]
    }

    else {
        if (args[1] < parseNode.maxY){
            parseNode.minY = args[1]
        }
    }

    if (args.length === 4)
    {
        var g = "generation_value";
        gen = args[0];
        //Keeps track of the number of populations in each generation
        //If generation_variable already exists, count increases
        if (generations[gen]) {
            generations[gen].count += 1
            generations[gen].sizing_count = generations[gen].count
        };

        //generation_variable is new, the count is initialized at 1
        if (!generations[gen]){
            generations[gen] = parseGen(gen, [gen, 1])
            generations[gen].sizing_count = generations[gen].count
        };

        var g = generations[args[0]].varName
        var g_yAxis = parseInt(getGenNum(g));
        var lat = latScale(args[1]) // height-latScale(args[1])
        var lon = longScale((args[2]))
        var size = args[3]/10000
        return new Node(varName, g, lon, lat, size, g_yAxis);
    }
}

function parseGen(varName, args){
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

    return args}

function parseElements(line){
    var file_stuff = ""
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

}

$(document).on("ready", function(){
    var filecon;
    var listNodes = [];
    nodesListIndex = 0;

    $("#filename").change(function(evt)
    {
        // Clear the page
        svgContainer.selectAll("circle").remove();
        svgContainer.selectAll("line").remove();
        svgContainer.selectAll("text").remove();
        nodes = {}
        edges = {}
        generations = {}

        // Reseting variables to track proportions
        setGen_yValues.node_count = undefined


        var ext = $("input#filename").val().split(".").pop().toLowerCase();
        var files = evt.target.files; // FileList Object
        
        // If there is a FileList Object present
        if (files != undefined){
            var reader = new FileReader();
            reader.onload = function (evt){
                var field = document.getElementById('main');                        
                field.innerHTML = evt.target.result;   

                // Parses through the elements contained in the file
                var elements = evt.target.result.split("\n");
                parseElements(elements);

                graph(nodes, edges, generations);
            };                  
            reader.readAsText(files[0]); 
        }
    });

    $("#view_selection").change(function(evt)
    {
        var selected_gen = document.getElementById('view_selection').value;
        var selected_nodes = {};
        var selected_edges = {};

        for (node in nodes){
            if (nodes[node].generation == selected_gen){
                curr_node = nodes[node];
                selected_nodes[node] = nodes[node];
            }
        }

        for (edge in edges){
            for (node in selected_nodes){
                if ((edges[edge].startnode).varName == node || (edges[edge].endnode).varName == node){
                    selected_edges[edge] = edges[edge];
                }                
            }
        }

        console.log(nodes)
        console.log(selected_nodes)
        svgContainer.selectAll("circle").remove();
        svgContainer.selectAll("line").remove();
        svgContainer.selectAll("text").remove();

        graphNodes(selected_nodes, "pos");
        graphGenerations(selected_gen, "pos");
        // graphEdges(selected_edges, "pos");
    });
});

function makeNodeLabel(node, mode){
    x_position = 0;
    y_position = 0;
    if (mode == "gen"){
        x_position = node.gen_xAxis;
        y_position = node.gen_yAxis;
    }
    else if (mode == "pos"){
        x_position = node.xLoc;
        y_position = (node.yLoc);
    }
    else {
        try {
            throw new Error("mode not correct");
        }
        catch (e) {
            alert(e.name + ': ' + e.message);
        }
    }

    var new_Node_label = labels.append("text").text(node.varName);
    new_Node_label.attr("y", y_position)
                .attr("x", x_position)
                .style("fill", "red");
}

function makeEdgeLabel(edge, mode){
    var startNode = edge.startnode
    var endNode = edge.endnode

    var x1 = 0;
    var x2 = 0;
    var y1 = 0;
    var y2 = 0;

    if (mode == "gen"){
        x1 = startNode.gen_xAxis;
        y1 = startNode.gen_yAxis;
        x2 = endNode.gen_xAxis;
        y2 = endNode.gen_yAxis;
    }
    else if (mode == "pos"){
        x1 = startNode.xPos;
        y1 = startNode.yPos;
        x2 = endNode.xPos;
        y2 = endNode.yPos;
    }

    var new_Edge_label = labels.append("text").text(edge.varName);
    try {
        new_Edge_label.attr("y", (y1 + y2)/2)
                .attr("x", (x1 + x2)/2)
                .style("fill", "blue")
                .style("font-size", 9);   
    }
    catch (Error) {
        alert(edge);
    }
}

// Returns the generation number of a generation or admixture generation
function getGenNum(gen_variable){
    if (gen_variable[0] == 'g'){
        return gen_variable.substr(1); // prints after "g" in g#
    }
    else{
        return gen_variable.substr(2); // prints after "ag" in ag#
    }
}

function graphGenerations(generations, mode){
    var yPos = 0
    var xPos = 0

    var genScale = d3.scale.linear()
        .domain([0,getMaxGen(generations)])
        .range([0.05*height,0.95*height])

    if (typeof(generations) == 'string' && mode=='pos'){
        xPos = 100;
        yPos = 100;
        var new_gen_label = labels.append("text").text(generations);
        new_gen_label.attr("y", yPos)
                    .attr("x", xPos)
                    .style("fill", "red");
    }
    else{
        for (gen in generations){
            if (mode == "gen"){
            yPos = genScale(getGenNum(gen));
            var new_gen_label = labels.append("text").text(gen);
            new_gen_label.attr("y", yPos)
                        .attr("x", xPos)
                        .style("fill", "red");
            }
        };
    }
}

function getMaxGen(generations){
    gen_values = Object.keys(generations)
    max_gen = 0
    for (i=0; i<gen_values.length;i++){
        gen_num = parseInt(gen_values[i].substr(1,gen_values[i].length))
        if (gen_num > max_gen){
            max_gen = gen_num
        }
    }
    return max_gen
}

function setGen_yValues(nodes){
    if (setGen_yValues.node_count === undefined){
        var node_count = Object.keys(nodes).length

        var genScale = d3.scale.linear()
            .domain([0,getMaxGen(generations)])
            .range([0.05*height,0.95*height])
        for (node in nodes){
            nodes[node].gen_yAxis = genScale(nodes[node].gen_yAxis);
        }        
    }
    setGen_yValues.node_count = Object.keys(nodes).length
}

function clear_generation_populations(generations){
    gens = Object.keys(generations)
    for (i=0; i<gens.length; i++){
        generations[gens[i]].populations = []
    }        
}

function graphNodes(nodes, mode){
    var xPos = 0;
    var yPos = 0;
    var node_size = 0;

    setGen_yValues(nodes) // Sets the y_values of the generational view so that they are proportional
    clear_generation_populations(generations) // Clear populations for output in exportAdditions

    for (node in nodes){
        // determines generational x_placement based on number of nodes in each generation
        node_sections = generations[nodes[node].generation].count + 1;
        node_placement = generations[nodes[node].generation].sizing_count;
        nodes[node].gen_xAxis = node_placement*(width*0.9)/node_sections

        // Different visualizations for generation and positional views
        if (mode == "gen"){
            xPos = nodes[node].gen_xAxis;
            yPos = nodes[node].gen_yAxis;
            node_size = 20;
        }
        else if (mode == "pos"){
            console.log("xPos" + String(nodes[node].xLoc))
            console.log("yPos" + String(latScale(nodes[node].yLoc)))
            xPos = nodes[node].xLoc;
            yPos = (nodes[node].yLoc);
            node_size = nodes[node].node_size;
        }

        var new_node = populationGroup.append("circle")
            .attr("cx", xPos)
            .attr("cy", yPos)
            .attr("r", node_size) 
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

            if (mode == "gen"){
                // decrement the generation
                generations[nodes[node].generation].sizing_count -= 1;
                // Add the population to the list of nodes
                generations[nodes[node].generation].populations.push(node)
            }

        additions.Nodes += nodes[node].varName + "; " 
        makeNodeLabel(nodes[node], mode);
    }
    // Resets the sizing counts for the next time switching to generation_view 
    for (gen in generations){
        generations[gen].sizing_count = generations[gen].count
    }
}
function graphEdges(edges, mode){
    for (edge in edges){        
        var startNode = edges[edge].startnode
        var endNode = edges[edge].endnode

        // Add populations to the nodes
        startNode.ancestor_relations.push(endNode)
        endNode.descent_relations.push(startNode)

        var x1 = 0;
        var x2 = 0;
        var y1 = 0;
        var y2 = 0;

        if (mode == "gen"){
            x1 = startNode.gen_xAxis;
            y1 = startNode.gen_yAxis;
            x2 = endNode.gen_xAxis;
            y2 = endNode.gen_yAxis;
        }
        else if (mode == "pos"){
            x1 = startNode.xPos;
            y1 = startNode.yPos;
            x2 = endNode.xPos;
            y2 = endNode.yPos;
        }

        var edge_info = {"x1": x1, "x2": x2, 
                        "y1": y1, "y2": y2};

        var edge_line = svgContainer.append("line")
            .attr("x1", edge_info['x1'])
            .attr("x2", edge_info['x2'])
            .attr("y1", edge_info['y1'])
            .attr("y2", edge_info['y2'])
            .attr("stroke-width", 2)
            .attr("stroke", "black")

        additions.Edges += startNode.varName + "to" + endNode.varName + " = edge(" + startNode.varName + ", " + endNode.varName  + ")\n";
        makeEdgeLabel(edges[edge], mode)
    }
}

// Performs the graph function using pre-defined functions
function graph(nodes, edges, generations){
    svgContainer.selectAll("circle").remove();
    svgContainer.selectAll("text").remove();
    graphNodes(nodes, "gen");
    graphEdges(edges, "gen");
    graphGenerations(generations, "gen"); 
}