<html>
<head>
    <!-- d3 -->
    <script type="text/javascript" src="/d3/d3.min.js"></script>

    <!-- DAT.GUI -->
    <script type='text/javascript' src='/datGUI/DAT.GUI.min.js'></script>
    
    <!-- jQuery -->
     <script type="text/javascript" src="/jquery/dist/jquery.js"></script>

    <!-- CSS Stylesheet -->
    <link rel="stylesheet" type="text/css" href="/stylesheets/app.css">
</head>

<body>

    <!--LABELS -->
    <div class="tooltip" id="tooltip" class="hidden">
        <p><strong></strong></p>
        <p><span id="value"></span></p>
    </div>

    <div id="main">                                                                

    </div>
    <!-- Reading in the graph -->
    <div id="container"></div>
    <input type="file" name="filename" id="filename">

    <!-- Changing graph view between gen and pos view -->
    <div id="change_view"></div>
    <input type="text" name="view_selection" id="view_selection">

    <button id="gen_view" onclick="graph(nodes, edges, generations)">Change to Gen</button>

    <script type="text/javascript" src="javascripts/app.js"></script>

    <script type="text/javascript">

    <?php
        $myfile = fopen("newfile.txt", "w") or die("Unable to open file!");
        $txt = "John Doe\n";
        fwrite($myfile, $txt);
        $txt = "Jane Doe\n";
        fwrite($myfile, $txt);
        fclose($myfile);
    ?>
        
        svg_max = 10000 // Later set to max of the svg
        width = 1000
        height = 800

        var longScale = d3.scale.linear()
            .domain([-180, 180])
            .range([0, width])

        var latScale = d3.scale.linear()
            .domain([-90, 90])
            .range([0, height])

        //Adding scaling factors
        var scale = d3.scale.linear()
            .domain([0,svg_max])
            .range([0,100]);
        
        var jsonCircle = [
            {"x_axis": 30, "y_axis": 30, "radius": 20, "color": "green"},
            {"x_axis": 60, "y_axis": 40, "radius": 20, "color": "blue"},
            {"x_axis": 90, "y_axis": 50, "radius": 20, "color": "red"}];
        
        var svgContainer = d3.select("body").append("svg")
                            .attr("width", width)
                            .attr("height", height);
        
        // Places all nodes inside svg group element <g></g>
        var populationGroup = svgContainer.append("g");

        var labels = svgContainer.append("g");

        // Associative Array to keep track of nodes
        var population_list = new Array();

        var Graph = null
        var bool = 0
        var nodes = {}
        var edges = {}
        var generations = {}

        var additions =  {
            Nodes: "NODE ADDITIONS\n",
            Edges: "EDGE ADDITIONS\n",
            Migrations: "MIGRATION ADDITIONS\n",
        }
        var coordinates = {
            Longitude: 20,
            Latitude: 20,
            Generation: 0,
        };
        var pop = {
            name: "NodeX",
            genValue: 0,
            genOffset: 0,
            genVariable: "generationVariable",
            size: 20,
            sizeOffset: 0,
        }; 
        var new_edge = {
            startNode: "NodeX",
            sNSize: 0,
            endNode: "NodeY",
            eNSize: 0,
        };
        var migrations = {
            startingEdge: "startingEdge",
            endingEdge: "endingEdge",
            rateVariable: 0,
        };

        /*
        GRAPH ADDITION FUNCTIONS
            AddEdge - 
            AddMigration - TODO
            AddNode
            ExportAdditions - Outputs additions to console
        */

        var obj = { 
            AddEdge:function(){            
                var sN = new_edge.startNode;
                var eN = new_edge.endNode;
                
                x1 = nodes[sN].xLoc
                x2 = nodes[eN].xLoc
                y1 = nodes[sN].yLoc
                y2 = nodes[eN].yLoc
                
                // console.log(population_list)
                // x1 = population_list[sN].x_axis
                // x2 = population_list[eN].x_axis
                // y1 = population_list[sN].y_axis
                // y2 = population_list[eN].y_axis
                
                // var new_edge_info = {"x1": x1, "x2": x2, "y1": y1, "y2": y2}

                // Adds edge to the svg 
                var new_edge_line = svgContainer.append("line")
                    .attr("x1", x1)
                    .attr("x2", x2)
                    .attr("y1", y1)
                    .attr("y2", y2)
                    .attr("stroke-width", 2)
                    .attr("stroke", "black")

                // Dictionary of tracked edges
                edgeName = sN + " to " + eN
                edges[edgeName] = new Edge(edgeName, nodes[sN], nodes[eN], new_edge.sNSize, new_edge.eNSize);  
                // Text output
                makeEdgeLabel(edges[edgeName]);
                additions.Edges += sN + "to" + eN + " = edge(" + sN + ", " + eN + ")\n";
            },
            AddMigration:function(){
                var sE = migrations.startingEdge;
                var eE = migrations.endingEdge;
                var rV = migrations.rateVariable;
                additions.Migrations += "migration(" + sE + "," + eE + "," + rV + ")\n";
            },  
            AddNode:function(){
                var x = coordinates.Longitude;
                var y = coordinates.Latitude;
                var z = coordinates.Generation;
                var name = pop.name;
                var genVal = pop.genValue;
                var genOS = pop.genOffset;
                var genVar = pop.genVariable;
                var pS = pop.size;
                var pSO = pop.sizeOffset;
                var node_info = {"x_axis": x, "y_axis": y, "radius": pS, "color": "green"}
                
                var node = populationGroup.append("circle")
                                .attr("cx", node_info.x_axis)
                                .attr("cy", node_info.y_axis)
                                .attr("r", node_info.radius)
                                .style("fill", node_info.color);
                nodes[name] = new Node(name, genVal, x, y, z);
                mode = "gen"

                makeNodeLabel(nodes[name], mode);
                
                additions.Nodes +=  genVar + " = gen(" + genVal + "," + genOS + ")\n" +
                name + " = node(" + genVar + ")\n" +
                "size" + name + " = size(" + pS + pSO + ")" + "\nLocation - Longitude: " + x + ", Latitude: " + y + ", Generation: " + z;
            },
            ExportAdditions: function(){
                Mich_input = ""
                gens = Object.keys(generations)
                gens.sort()
                prev_pops = []
                generation_lines = []
                relation_lines = []

                for (i=0; i<gens.length; i++){
                    line = ""
                    pops_at_gen = generations[gens[i]].populations
                    
                    line += getGenNum(gens[i]) + " "

                    rel_line = ""

                    if (prev_pops.length!=0) {
                        relation = []
                        for (j=0; j<pops_at_gen.length; j++){
                            curr_node = nodes[pops_at_gen[j]]
                            for (k=0; k<prev_pops.length; k++){
                                descendent = prev_pops[k]
                                if (curr_node.descent_relations.indexOf(descendent) > -1){
                                    relation.push((k+1).toString() + "-" + (j+1).toString())
                                }
                            }
                        }
                        relation.sort()
                        rel_line = relation.join(" ")
                        relation_lines.push(rel_line)
                    }
                    prev_pops = []
                    for (j=0; j<pops_at_gen.length; j++){
                        curr_node = nodes[pops_at_gen[j]]
                        line += curr_node.node_size + " "
                        prev_pops.push(curr_node)           // In same order as line
                    }

                    generation_lines.push(line)
                }
                output = ""
                output += generation_lines.shift()
                while (generation_lines.length!=0){
                    output+= '\n' + relation_lines.shift()
                    output+= '\n' + generation_lines.shift()
                }
                console.log(output)
            }
        };

        function getGenNum (gen_Name){
            gen_Num = ""
            if (gen_Name[0] == "a"){
                gen_Num = gen_Name.substring(2,gen_Name.length)
            }
            else {
                gen_Num = gen_Name.substring(1,gen_Name.length)
            }
            return gen_Num
        }

        //DAT.GUI to add a Node
        var gui = new dat.GUI();
        var f2 = gui.addFolder('Population Coordinates');
            f2.add(coordinates, 'Longitude');
            f2.add(coordinates, 'Latitude');
            f2.add(coordinates, 'Generation');
            
        var f3 = gui.addFolder('Population Parameters');
            f3.add(pop, 'name');
            f3.add(pop, 'genValue');
            f3.add(pop, 'genOffset');
            f3.add(pop, 'genVariable');
            f3.add(pop, 'size');
            f3.add(pop, 'sizeOffset');
            
        gui.add(obj,'AddNode');
        var f4 = gui.addFolder('Edges');
            f4.add(new_edge, 'startNode');
            f4.add(new_edge, 'sNSize');
            f4.add(new_edge, 'endNode');
            f4.add(new_edge, 'eNSize');   
        gui.add(obj,'AddEdge'); // Add is the name of a function in the variable, obj
        var f5 = gui.addFolder('Migrations');
            f5.add(migrations, 'startingEdge');
            f5.add(migrations, 'endingEdge');
            f5.add(migrations, 'rateVariable');
            
        gui.add(obj, 'AddMigration');
        gui.add(obj, 'ExportAdditions');     
    </script>
    
</body>
    
</html>