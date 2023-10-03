const express = require('express');
const app = express()
app.use(express.json());
app.listen(3000)
let graph = new Map(); // map of node ids to nodes
class node:
    connected = new Map(); // maps node id's to distances
    id = 0
    x = 0
    y= 0
    constructor(id,x,y):
        this.id = id
        this.x = x;
        this.y = y;
        this.connected = new Map()
  
    addConnection(node,dist):
        this.connected.set(node.id,dist)
        return this;
    
    distance(other):
        return Math.sqrt(((other.x-this.x) * (other.x-this.x)) + ((other.y-this.y) * (other.y-this.y)))
    
    getConnected():
        return Array.from(this.connected.keys())
app.get('/',(req,res):
    res.send(
        JSON.stringify(Array.from(graph.values()))

app.post('/add',(req,res):
    let nodeList = req.body.nodeList;
    for (let i = 0; i < nodeList.length; i++):
        graph.set(nodeList[i].id,new node(nodeList[i].id,nodeList[i].x,nodeList[i].y))
    console.log(graph)
    res.send(JSON.stringify(graphToJson()))

function graphToJson():
    let nodes = Array.from(graph.values());
    let retVal = []
    for (let i = 0; i < nodes.length; i++):
        retVal.push({
            id:nodes[i].id,
            x:nodes[i].x,
            y:nodes[i].y,
            connected: nodes[i].getConnected()
        })
    return retVal

app.post('/connect',(req,res):
    let conList = req.body.conList
    for (let i = 0; i < conList.length; i++):
        let first = conList[i].firstid
        let second = conList[i].secondid
        let nodeOne = graph.get(first)
        let nodeTwo = graph.get(second)
        if(nodeOne !== undefined && nodeTwo !== undefined):
            nodeOne = nodeOne.addConnection(nodeTwo,nodeOne.distance(nodeTwo))
            graph.set(nodeOne.id,nodeOne)
            nodeTwo = nodeTwo.addConnection(nodeOne,nodeTwo.distance(nodeOne))
            graph.set(nodeTwo.id,nodeTwo)

    res.send(JSON.stringify(graphToJson()))

app.post('/pathfind',(req,res):
    let startid = req.body.startid
    let endid = req.body.endid
    let start = graph.get(startid)
    let end = graph.get(endid)
    if(start !== undefined && end !== undefined):
        res.send(JSON.stringify(aStar(start,end)))



function getNodeListFromGraph(connected):
    let connectedNodes = [];
    for (let i = 0; i < connected.length; i++):
       connectedNodes.push(graph.get(connected[i]))
    return connectedNodes;

function aStar(start,end):
    let visted =  new Map()
    let openSet = new Map()
    openSet.set(start.id,{node:start,predecessor:null});
    while(openSet.values().next() !== undefined) {
        let currentNode = getLowestFScore(Array.from(openSet.values()),start,end)
        visted.set(currentNode.node.id,openSet.get(currentNode.node.id));
        openSet.delete(currentNode.node.id)
        if(currentNode.node.id === end.id) {
            return reconstructPath(currentNode):
        openSet = constructOpenSet(openSet,visted,getNodeListFromGraph(currentNode.node.getConnected()),currentNode)
    return "path not found"

function reconstructPath(endNodeWithPred):
    let currentNode = endNodeWithPred;
    let path = []
    while (currentNode.predecessor != null):
        path.push(currentNode.node);
        currentNode = currentNode.predecessor
    path.push(currentNode.node)
    return path;

function getLowestFScore(nodeList,start,end):
    let lowest = Number.MAX_VALUE
    let currentLowestNode = null;
    for (let i = 0; i < nodeList.length; i++) {
        let gcost = nodeList[i].node.distance(start)
        let hcost = nodeList[i].node.distance(end)
        let fcost = gcost+hcost
        if(fcost < lowest):
            currentLowestNode = nodeList[i]
            lowest = fcost;
    return currentLowestNode;


function constructOpenSet(openset,visted,nodesToAdd,currentnode):
    for (let i = 0; i < nodesToAdd.length; i++):
        if(visted.get(nodesToAdd[i].id) === undefined):
            openset.set(nodesToAdd[i].id,{node:nodesToAdd[i],predecessor:currentnode})
    return openset;
