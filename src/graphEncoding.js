
export function handEledgelist(edgeText){
    var nodes = new Set()
    const edges = []
    const dependCount = {}
    edgeText.split("\r\n").forEach(line => {
        if(line !== ""){
            const [start,end] = line.split(" ")
            nodes.add(start)
            nodes.add(end)
        }
    });
    nodes = Array.from(nodes)
    
    edgeText.split("\r\n").forEach(line => {
        if(line !== ""){
            const [start,end] = line.split(" ")
            edges.push([nodes.indexOf(start),nodes.indexOf(end)])
            if(dependCount[start] === undefined){
                dependCount[start] = 1
            }else{
                dependCount[start] += 1
            }
            if(dependCount[end] === undefined){
                dependCount[end] = 1
            }else{
                dependCount[end] += 1
            }
        }
    });

    const dependCountArray = []
    for(let node of nodes){
        dependCountArray.push(dependCount[node])
    }
    return {nodes:nodes,edges:edges,dependentsCount:dependCountArray}
}

export function handelClustering ( clusterText ) {
    const lines = clusterText.split("\n")
    // console.log(lines)
    const postion = new Map()
    for(let i = 1 ; i <= clusterText.length ; i++){
        if(lines[i] !== undefined && lines[i].length > 1){
            const record = lines[i].split(" ")
            const nodeName = record[0]
            const x_val = Number(record[1])
            const y_val = Number(record[2])
            postion.set(nodeName,[x_val,y_val])
        }
    }
    return postion
}