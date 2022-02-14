//measurement for edge bundling diagram svg
var diameter = 550,
    radius = diameter / 2,
    innerRadius = radius - 110;

// measurement for chord diagram svg
var diameter_2 = 700,
    radius_2 = diameter_2 / 2,
    innerRadius_2 = radius_2 - 120;

var cluster = d3.cluster()
    .size([360, innerRadius]);

var line = d3.radialLine()
    .curve(d3.curveBundle.beta(0.85))
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });


var svg = d3.select("#edgeBundling").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");


var svg2 = d3.select("#chordDiagram").append("svg")
    .attr("width", diameter_2)
    .attr("height", diameter_2)
    .append("g")
    .attr("transform", "translate(" + (radius_2-10) + "," + (radius_2-10 )+ ")");


// Read in Bias types
var bias_types;
d3.json('/bias_types',function(data){
    // console.log(data)
    globalThis.bias_types=data
});


// Read in Bias Dictionary
var bias_dictionary;
d3.json('/bias_dictionary',function(data){
    // console.log(data)
    globalThis.bias_dictionary=data
});


// Read in Maximum individual and intersectional bias score
var max_bias_scores;
d3.json('/max_bias_dictionary',function(data){
    // console.log(data)
    max_bias_scores=data
});


// generate a map of bias scores  and max bias scoresfor all words from the data from pyhton
Bias_map= new Map();
Max_Bias_map= new Map();

function convert_to_map(){
Object.keys(bias_dictionary).map(function(key) {
    Bias_map.set(key,bias_dictionary[key])
  });
//  console.log(Bias_map)

 Object.keys(max_bias_scores).map(function(key) {
    Max_Bias_map.set(key,max_bias_scores[key])
  });
//  console.log(Max_Bias_map)

}


// Rendering the Topic Chart each time a new topic is selected 
function selectTopic(index){

   convert_to_map();
  // Clear the svg to get rid off any previous chart
  svg.selectAll(".node").remove();
  svg.selectAll(".link").remove();

  // Clear the svg2 to get rid off any previous chart
  svg2.selectAll(".node").remove();  
  svg2.selectAll(".link").remove();

  // Declare new nodes and links for edge bundling diagram
  var link = svg.append("g").selectAll(".link"),
      node = svg.append("g").selectAll(".node");

   // Declare new nodes and links for chord diagram
   var link2 = svg2.append("g").selectAll(".link"),
       node2 = svg2.append("g").selectAll(".node");


   // Create the clusters and links
   d3.json('/cluster_data',function(data){
  
        var root = packageHierarchy(data.all_clusters[index])
        .sum(function(d) { return d.size; });

        // Cluster the hierarchy file to get leaves of all nodes
        cluster(root)

       // Create the links
       link = link
       .data(importWordNodes(root.leaves()))
       .enter().append("path")
       .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
       .attr("class", "link")
       .attr("d", line);


        // Create the nodes
        node = node
        .data(root.leaves())
        .enter().append("text")
        .attr("class", "node")
        .attr("dy", "0.31em")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .text(function(d) {return d.data.key; })
        .on("mouseover", mouseovered)
        .on("mouseout", mouseouted)
        .on("click", clicked);
    });

    // Mouseover function for links
    function mouseovered(d) {
    node
        .each(function(n) { n.target = n.source = false; });
    
    link
        .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
        .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
        .filter(function(l) { return l.target === d || l.source === d; })
        .raise();
    
    node
        .classed("node--target", function(n) { return n.target; })
        .classed("node--source", function(n) { return n.source; });
    }
    
    // Mouseout function for links
    function mouseouted(d) {
    link
        .classed("link--target", false)
        .classed("link--source", false);
    
    node
        .classed("node--target", false)
        .classed("node--source", false);
    }

    //onClick function for nodes
    function clicked(d){ 
        svg2.selectAll("g").remove();
        // console.log(d);

        var position_map= new Map();

        // create a map with all words and their position created by d3 cluster
        d.parent.children.forEach(function(obj){
            position_map.set(obj.data.key,[obj.x,obj.y+60]);
        });

        // console.log(position_map);


        // Clear the svg2 to get rid off any previous chart
        svg2.selectAll(".node").remove();
        svg2.selectAll(".link").remove();

        // REdefine new nodes and links
        link2 = svg2.append("g").selectAll(".link");
        node2 = svg2.append("g").selectAll(".node");

        // append the root node to the list of related nodes
        if(!d.data.similar_index.includes(d.data.key))
           d.data.similar_index.push(d.data.key);

        // Create the nodes for svg 2 for Chord diagram
        node2 = node2
        .data(d.data.similar_index)
        .enter().append("text")
        .attr("class", "node")
        .attr("dy", "0.31em")
        .attr("transform", function(d) { 
            [pos_x,pos_y]=position_map.get(d);
            return "rotate(" + (pos_x - 90) + ")translate(" + (pos_y + 8) + ",0)" + (pos_x < 180 ? "" : "rotate(180)"); 
        })
        .attr("text-anchor", function(d) { [pos_x,pos_y]=position_map.get(d); return pos_x < 180 ? "start" : "end"; })
        .attr("id", function(d) { return "id"+d;})
        .attr("title",function(d){return d;})
        .text(function(d) { return d; })
        .on("click", function(d){
            var clicked_word=d3.select(this).attr("title");
            scrollToPlot(clicked_word);
        });


        //Draw the arcs of chord diagram
        drawChords(d);

        // Draw the bar plots for these words
        drawBarPlots(d,Bias_map);
    }

      
}




// Construct the package hierarchy data
function packageHierarchy(classes) {
    var map = {};
  
    function find(word, data) {
      var node = map[word], i;
      if (!node) {
        node = map[word] = data || {name: word, children: []};
        if (word.length) {
          node.parent = find(word.substring(0, i = word.lastIndexOf(".")));
          node.parent.children.push(node);
          node.key = word.substring(i + 1);
        }
      }
      return node;
    }
  
    classes.forEach(function(d) {
      find(d.word, d);
    });
  
    return d3.hierarchy(map[""]);
  }


// Return a list of connected words for the given array of nodes.
function importWordNodes(nodes) {
    var map = {},
        words = [];
  
    // Compute a map from name to node.
    nodes.forEach(function(d) {
      map[d.data.word] = d;
    });
  
    // For each import, construct a link from the source to target node.
    nodes.forEach(function(d) {
      if (d.data.similar_index) d.data.similar_index.forEach(function(i) {
        words.push(map[d.data.word].path(map[i]));
      });
    });
  
    return words;
  }


// generate dropdown menu for topic search
d3.json('/topic_data', function(data){
    var contents=document.getElementById("topicDropDown");
    for(var i in data.topics){
        var option = document.createElement("a");
        option.setAttribute('class','dropdown-item');
        option.setAttribute('onClick','selectTopic('+i+')');
        option.text = data.topics[i].topic;
        var list = document.createElement("li");
        list.appendChild(option)
        contents.appendChild(list);
    }
});


// ######################################### Functions for Creating the Chord Diagram######################
function drawChords(d){

    // console.log(d)
    // console.log(bias_types)
    // console.log(bias_dictionary)
    // console.log(Max_Bias_map)

    //create a bucket/map for the bias and two array for subgroups and types presented in the clicked data

    // Create the three matrix from the data
    var onclick_bias_map= new Map();
    var onclick_types=[];
    var onclick_subgroups=[];


    d.data.similar_index.forEach((word)=>{
        temp_bias_array=Max_Bias_map.get(word)
        temp_subgroup_array=[]
        temp_bias_array.forEach((obj)=>{
            if(!onclick_subgroups.includes(obj.subgroup))
                 onclick_subgroups.push(obj.subgroup)
            if(!onclick_types.includes(obj.type))
                 onclick_types.push(obj.type)
            temp_subgroup_array.push(obj.subgroup)
        })
        
        if(temp_subgroup_array.length>0){
            map_key=JSON.stringify(temp_subgroup_array)
            if(onclick_bias_map.has(map_key))
                 onclick_bias_map.get(map_key).push(word);
            else 
                 onclick_bias_map.set(map_key,[word])
        }

    })

    // console.log(onclick_types)
    // console.log(onclick_subgroups)
    // console.log(onclick_bias_map)

    // Reorder the types and subgroups for visualization so that same subgroups of same type stay next to each other
    var re_onclick_types=[];
    var re_onclick_subgroups=[];
    bias_types.forEach((obj)=>{
        if(onclick_types.includes(obj.type)){
            re_onclick_types.push(obj.type);
        }

        obj.subgroup.forEach((sb)=>{
            if(onclick_subgroups.includes(sb))
               re_onclick_subgroups.push(sb);
        })

    })
    // console.log(re_onclick_types)
    // console.log(re_onclick_subgroups)

    var N= re_onclick_subgroups.length;
    var M= re_onclick_types.length;

    // create two NxN matrix
    
    let Bias_Matrix=[...Array(N)].map(e => Array(N).fill(0));
    let Color_Matrix=[...Array(N)].map(e => Array(N).fill(0));
    let Type_Matrix=[...Array(M)].map(e => Array(M).fill(0));


    // create one MxM matrix for outer layer of the chord diagram
    Type_Matrix=[];
    for(i=0;i<M;i++){
        temp_matrix=[]
        for(var j=0;j<M;j++){
            temp_matrix.push(0);
        }
        Type_Matrix.push(temp_matrix);
    }

    // populate the bias and color matrix 
    var indx=0;
    
    // onclick_bias_map.forEach((bias)=>{
    //     console.log(bias);
    // })

    // console.log(Bias_Matrix);

    for (let [key, value] of onclick_bias_map) {
        sub_groups= JSON.parse(key);
        // console.log(key)
        // console.log(sub_groups);
        if(sub_groups.length==1){
            mat_indx= re_onclick_subgroups.indexOf(sub_groups[0])
            agg_bias_score=0;
            value.forEach((word)=>{
                var tmp_array=Max_Bias_map.get(word);
                tmp_array.forEach((obj)=>{
                    agg_bias_score+=obj.bias_score;
                });

            });
            // console.log(mat_indx);
            Bias_Matrix[mat_indx][mat_indx]=(agg_bias_score*1000);
            Color_Matrix[mat_indx][mat_indx]=indx;
            indx++;
            // console.log(agg_bias_score);
            // console.log(Bias_Matrix);
        }

        else if(sub_groups.length>1){
            var mat_indx=[];
            sub_groups.forEach((sb_group)=>{
                mat_indx.push(re_onclick_subgroups.indexOf(sb_group));
            })
            top_indx=sub_groups.length
            var ag_score_array=[];
            for(var i=0;i<top_indx;i++){
                ag_score_array.push(0);
            }
            for(var i=0;i<top_indx;i++){
                current_sb=sub_groups[i]
                value.forEach((word)=>{
                    tmp_array=Max_Bias_map.get(word);
                    tmp_array.forEach((obj)=>{
                        indx_sb= sub_groups.indexOf(obj.subgroup);
                        ag_score_array[indx_sb]+=obj.bias_score;
                        
                    })
    
                })
                
            }
            // console.log(ag_score_array);
            // console.log(mat_indx)
            // console.log(Bias_Matrix)
            let last_indx=mat_indx[top_indx-1]
            for(var i=top_indx-1;i>0;i--){
                var current_index=last_indx;
                var next_index= mat_indx[i-1];
                // console.log(current_index+","+next_index)
                Bias_Matrix[current_index][next_index]= ag_score_array[top_indx-1]*1000;
                Bias_Matrix[next_index][current_index]= ag_score_array[i-1]*1000;
                Color_Matrix[current_index][next_index]= indx;
                Color_Matrix[next_index][current_index]= indx;
                

            }
            //per bias there will be one color
            indx++;
        }

    }

    // console.log(Bias_Matrix)
     
    // populte the type matrix for outer layer
    bias_types.forEach((obj)=>{
        if(re_onclick_types.includes(obj.type)){
            type_idx=re_onclick_types.indexOf(obj.type);
            obj.subgroup.forEach((sb)=>{
                if(re_onclick_subgroups.includes(sb)){
                    var tmp_idx= re_onclick_subgroups.indexOf(sb);
                    var sum=0;
                    
                    for(var i=0; i<Bias_Matrix[0].length;i++){
                        sum+=Bias_Matrix[tmp_idx][i];
                    }
                   
                Type_Matrix[type_idx][type_idx]+=sum;

                }
                   
            }) ;
        }

    });

    // console.log(Type_Matrix)
    // Draw the chord diagram from the generated Matrix

    var colors=["#4682b4","#32a852","#a8324c","#8732a8","#e68619","#32a8a2","#9cde31","#90dafc","#b34286","#7da183","#9e5565","#B983FF","#94B3FD","#94DAFF","#99FEFF","#142F43","#FFAB4C",
      "#FF5F7E","#B000B9","#E1701A","#F7A440"]

    //give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
    var res = d3.chord()
    .padAngle(0.03)     // padding between entities 
    .sortSubgroups(d3.descending)
    (Bias_Matrix);


    //give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
    var res2 = d3.chord()
    .padAngle(0.045)     // padding between entities 
    .sortSubgroups(d3.descending)
    (Type_Matrix);

    // add the groups on the inner part of the circle
    svg2
    .datum(res)
    .append("g")
    .selectAll("g")
    .data(function(d) { return d.groups; })
    .enter()
    .append("path")
    .style("fill", "#bbbfca")
    .style("stroke", "black")
    .style("opacity",0.5)
    .attr("d", d3.arc()
    .innerRadius(180)
    .outerRadius(200))
    .attr("id",function(d,i){return "group"+i;})
    .on("mouseover",function(d){
        div.transition()		
            .duration(200)		
            .style("opacity", .9);		
        div.html(re_onclick_subgroups[d.index])
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
    })
    .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    });

    // add the super groups on the outer part of the circle
    svg2
    .datum(res2)
    .append("g")
    .selectAll("g")
    .data(function(d) { return d.groups; })
    .enter()
    .append("path")
    .style("fill", "#bbbfca")
    .style("stroke", "black")
    .style("opacity",0.7)
    .attr("d", d3.arc()
    .innerRadius(200)
    .outerRadius(215))
    .attr("id",function(d,i){return "group_2"+i;})
    .on("mouseover",function(d){
        div.transition()		
            .duration(200)		
            .style("opacity", .9);		
        div.html(re_onclick_types[d.index])
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
    })
    .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    });


    // Add the links between groups
    svg2
    .datum(res)
    .append("g")
    .selectAll("path")
    .data(function(d) {return d; })
    .enter()
    .append("path")
    .attr("d", d3.ribbon().radius(180))
    .attr("class", function(d){return "class"+Color_Matrix[d.source.index][d.target.index];})
    .attr("fill", function(d,i){ 
        // console.log(d);
        return colors[Color_Matrix[d.source.index][d.target.index]]})
    .style("stroke", "black")
    .style("opacity",0.3)
    .on("mouseover",function(d){
        d3.select(this).style("opacity",1.0);
        var classname="."+d3.select(this).attr('class');
        d3.selectAll(classname).style("opacity",1.0);
        var index_in_bias_map= Color_Matrix[d.source.index][d.target.index];
        let related_words=[];
        // read the words related to this bias
        var tmp_count=0;
        for (let [key, value] of onclick_bias_map) {
            if(tmp_count==index_in_bias_map){
                value.forEach((w)=>{
                    related_words.push(w);
                })
                break;
            }
            else
                tmp_count++;
        }
        console.log(related_words)
        // Highlight those words
        related_words.forEach((w)=>{
            id_name= "#id"+w;
            this_color= d3.select(this).attr('fill');
            d3.selectAll(id_name).style("fill",this_color).style("font-size","18px").style("font-weight","400");
            // .style("font-weight","400");
        });
    })
    .on("mouseout",function(d){
        d3.select(this).style("opacity",0.5);
        var classname="."+d3.select(this).attr('class');
        d3.selectAll(classname).style("opacity",0.3);
        var index_in_bias_map= Color_Matrix[d.source.index][d.target.index];
        let related_words=[];
        // read the words related to this bias
        var tmp_count=0;
        for (let [key, value] of onclick_bias_map) {
            if(tmp_count==index_in_bias_map){
                value.forEach((w)=>{
                    related_words.push(w);
                })
                break;
            }
            else
                tmp_count++;
        }
  
        // Unhighlight those words
        related_words.forEach((w)=>{
            id_name= "#id"+w;
            d3.selectAll(id_name).style("fill","#495464").style("font-size","15px").style("font-weight","300");
        });
    });

    // add labels
    svg2.append("g").selectAll("text")
    .data(res.groups)
    .enter().append("text")
    .attr("dx", 2)
    .attr("dy", 17)
    .append("textPath")
    .attr("class", "label")
    .attr("xlink:href", function(d) { return "#group" + d.index; })
    .text(function(d) { return re_onclick_subgroups[d.index]; })
    .style("fill", "black")
    .style("opacity",0.9)
    .style("font-size","10px");

    // add labels for super groups
    svg2.append("g").selectAll("text")
    .data(res2.groups)
    .enter().append("text")
    .attr("dx", 14)
    .attr("dy", 9)
    .append("textPath")
    .attr("class", "label")
    .attr("xlink:href", function(d) { return "#group_2" + d.index; })
    .text(function(d) { return re_onclick_types[d.index]; })
    .style("fill", "black")
    .style("opacity",0.9)
    .style("font-size","10px");


}

// $(document).on('submit','#search-input',function(e)
//                    {
//       console.log('hello');
//       e.preventDefault();
//       $.ajax({
//         type:'POST',
//         url:'/',
//         data:{
//           todo:$("#search-input").val()
//         },
//         success:function()
//         {
//           alert('saved');
//         }
//       })
//     });