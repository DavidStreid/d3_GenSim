genSim.html
******

SVG GRAPHING
Defines SVG
populationGroup - appends a “g” object to the svg
labels - appends a “g” object to the svg

VARIABLES
nodes, edges, generations - dictionaries keeping track
additions - console output of additions made to the graph

DAT.GUI
parameter_folders - coordinates, pop, new_edge, migrations
graph_functions - AddEdge, AddMigration, AddNode, Export Additions


app.js
******

ADMIXTURE PARAMETERS
GraphInfo(nodes, edges, generations)
Generation(varName, value, offset)
Node(varName, gen, x, y, z) <- added x,y,z 9/23/15
Edge(varName, start, end, start_size, end_size)
Migration(varName, start, end, adMixSize)

PARSING FUNCTIONS
parseSize - 

ADDING NODES
9/5 - it is assumed that a node that has not been added belongs to the most recent population, g0

ADDING GENERATIONS
G0 - Current (contemporary) generation
*GENERATIONS SHOULD BE LISTED IN THE ORDER OF NEWEST TO OLDEST
