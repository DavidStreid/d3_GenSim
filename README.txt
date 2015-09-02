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
Node(varName, gen, x, y, z)
Edge(varName, start, end, start_size, end_size)
Migration(varName, start, end, adMixSize)

PARSING FUNCTIONS
parseSize - 
