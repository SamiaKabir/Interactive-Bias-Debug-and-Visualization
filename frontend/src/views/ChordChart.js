import { useD3 } from '../hooks/useD3';
import React , { useEffect, useState }from 'react';
import * as d3 from 'd3';
import {event} from 'd3-selection';
import './ChordChart.css';


const ChordChart= React.memo((props) => {
    const data=props.data;
    // const bias_types=props.bias_types;
    const bias_dictionary=props.bias_dictionary;
    const max_bias_scores=props.max_bias_scores;


    // Read in Bias types
    const [bias_types,setBias_types]=useState(0);
    useEffect(() => {
    d3.json("/bias_types").then((d) => {
        setBias_types(d);

    });
    return () => undefined;
    }, []);

    // generate a map of bias scores  and max bias scoresfor all words from the data from pyhton
    var Bias_map= new Map();
    var Max_Bias_map= new Map();

    // convert python dictionaries to JS map

    function convert_to_map(){
        Object.keys(bias_dictionary).map(function(key) {
            Bias_map.set(key,bias_dictionary[key])
        });
        // console.log(Bias_map)

        Object.keys(max_bias_scores).map(function(key) {
            Max_Bias_map.set(key,max_bias_scores[key])
        });
        // console.log(Max_Bias_map)
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
    
    // var test_intr=1;

    // function to trim a label if it's too big
    function dotme(text) {
        text.each(function() {
            var text = d3.select(this);
            var words = text.text().split("");
            
            var ellipsis = text.text('').append('tspan').attr('class', 'elip').text('...');
            var width = parseFloat(text.attr('width')) - ellipsis.node().getComputedTextLength();
            var numWords = words.length;
            
            var tspan = text.insert('tspan', ':first-child').text(words.join(' '));
            
            // Try the whole line
            // if it's too long, and more characters left, keep removing one by one
            
            while (tspan.node().getComputedTextLength() > width && words.length) {
                words.pop();
                tspan.text(words.join(' '));
            }
            
            if (words.length === numWords) {
                ellipsis.remove();
            }
        });
    }

    // get all subsets of an array
    const getAllSubsets = theArray => theArray.reduce(
        (subsets, value) => subsets.concat(
        subsets.map(set => [value, ...set])
        ),
        [
        []
        ]
    );

                    
    // create random color for all biases
    
    var colors=["#4682b4","#32a852","#a8324c","#8732a8","#e68619","#32a8a2","#9cde31","#90dafc","#b34286","#7da183",
                "#9e5565","#B983FF","#94B3FD","#94DAFF","#99FEFF","#142F43","#FFAB4C","#FF5F7E","#B000B9","#E1701A",
                '#67fbd4', '#183d57', '#df19f6', '#3f2311', '#5e8885', '#7b4665', '#6e8f00', '#159c27', '#935f63', 
                '#161933', '#d7b7eb', '#c770dd', '#251c0', '#567830', '#3a35ea', '#56b518', '#29e09c', '#24ad2', 
                '#973f98', '#bb6d1d', '#c7d867', '#25009a', '#b51f33', '#f13a69', '#8677d4', '#e421aa', '#123950',
                '#1d89a9', '#de2f46', '#42c0d2']
    

    function getColor(index){
        if(colors.length<=index){
        var randomColor = Math.floor(Math.random()*16777215).toString(16);
        while(colors.includes(randomColor)){
            randomColor = Math.floor(Math.random()*16777215).toString(16);
        }
        colors.push("#"+randomColor);
        }
    }

// D3 rendering hook of chord chart

    const ref = useD3(
        (svg) => {
            // measurement for chord diagram svg
            const diameter_2 = 600;
            const radius_2 = diameter_2 / 2;
            const innerRadius_2 = radius_2 - 80;

            var cluster = d3.cluster()
                          .size([360, innerRadius_2]);

            if(bias_dictionary && max_bias_scores){
                convert_to_map();
            }


            // Clear the svg to get rid off any previous chart
            svg.selectAll(".node").remove(); 
            svg.selectAll("g").remove();


            // Declare new nodes for chord diagram
            var svg_new = svg.append("g").attr("transform", "translate(" + (radius_2+145) + "," + (radius_2+135)+ ")")
            var node=svg_new.selectAll(".node");

            if(data!==null){
                var cluster_data=[]
                data.data.map((words)=>{
                    var newobj={"word":words,"similar_index":[]}
                    cluster_data.push(newobj)


                })
                // console.log(cluster_data)

                // create higherarchy for D3 clustering
                var root = packageHierarchy(cluster_data)
                .sum(function(d) { return d.size; });

                // Cluster the hierarchy file to get leaves of all nodes
                cluster(root);
                // console.log(data.data)
                // console.log(root)



                // Create the three matrix from the data
                var onclick_bias_map= new Map();
                var onclick_types=[];
                var onclick_subgroups=[];
                var perWord_Bias_map=new Map();
                var bias_id_map=new Map();

                //create a bucket/map for the bias and array for subgroups and types presented in the data
                data.data.forEach((word)=>{
                    const temp_bias_array=Max_Bias_map.get(word)
                    // console.log(temp_bias_array)
                    // create the list of bias types and subgroup present in the current selection
                    var temp_subgroup_array=[]
                    if(temp_bias_array){
                        temp_bias_array.forEach((obj)=>{
                            if(!onclick_subgroups.includes(obj.subgroup))
                                onclick_subgroups.push(obj.subgroup)
                            if(!onclick_types.includes(obj.type))
                                onclick_types.push(obj.type)
                            temp_subgroup_array.push(obj.subgroup)
                        })
                    }
                    // createa map of single and intersectional biases present in the current selection
                    if(temp_subgroup_array.length>0){
                        const num_biases=temp_subgroup_array.length;
                        var per_word_biases=[]
                        
                        var subset_array=getAllSubsets(temp_subgroup_array);
                        
                        for(let i=1; i<subset_array.length;i++){
                            // const map_key=JSON.stringify(temp_subgroup_array.slice(0,i+1));
                            const map_key=JSON.stringify(subset_array[i]);
                            per_word_biases.push(map_key);
                            if(onclick_bias_map.has(map_key))
                                onclick_bias_map.get(map_key).push(word);
                            else 
                                onclick_bias_map.set(map_key,[word])

                        }
                        perWord_Bias_map.set(word,per_word_biases);
                        
                    }

                });

                // console.log(onclick_types)
                // console.log(onclick_subgroups)
                // console.log(onclick_bias_map)

                // Reorder the types and subgroups for visualization so that same subgroups of same type stay next to each other
                var re_onclick_types=[];
                var re_onclick_subgroups=[];
                if(bias_types){
                    bias_types.forEach((obj)=>{
                        if(onclick_types.includes(obj.type)){
                            re_onclick_types.push(obj.type);
                        }
    
                        obj.subgroup.forEach((sb)=>{
                            if(onclick_subgroups.includes(sb))
                                re_onclick_subgroups.push(sb);
                        })
                    })
                }

                // console.log(re_onclick_types)
                // console.log(re_onclick_subgroups)

                const N= re_onclick_subgroups.length;
                const M= re_onclick_types.length;

                // create two NxN matrix
    
                let Bias_Matrix=[...Array(N)].map(e => Array(N).fill(0));
                let Color_Matrix=[...Array(N)].map(e => Array(N).fill(0));
                let Type_Matrix=[...Array(M)].map(e => Array(M).fill(0));


                // create one MxM matrix for outer layer of the chord diagram
                let type_Matrix=[];
                for(let i=0;i<M;i++){
                    let temp_matrix=[]
                    for(var j=0;j<M;j++){
                        temp_matrix.push(0);
                    }
                    type_Matrix.push(temp_matrix);
                }

                // populate the bias and color matrix 
                let indx=0;

                for (let [key, value] of onclick_bias_map) {
                    let sub_groups= JSON.parse(key);
                    // console.log(key)
                    // console.log(sub_groups);
                    if(sub_groups.length==1){
                        var mat_indx= re_onclick_subgroups.indexOf(sub_groups[0])
                        var agg_bias_score=0;
                        value.forEach((word)=>{
                            var tmp_array=Max_Bias_map.get(word);
                            tmp_array.forEach((obj)=>{
                                agg_bias_score+=obj.bias_score;
                            });
            
                        });
                        // console.log(mat_indx);
                        Bias_Matrix[mat_indx][mat_indx]=(agg_bias_score*1000);
                        Color_Matrix[mat_indx][mat_indx]=indx;
                        // put into bias id map
                        bias_id_map.set(key,indx);
                        indx++;
                        // console.log(agg_bias_score);
                        // console.log(Bias_Matrix);
                    }
            
                    else if(sub_groups.length>1){
                        var mat_indx=[];
                        sub_groups.forEach((sb_group)=>{
                            mat_indx.push(re_onclick_subgroups.indexOf(sb_group));
                        })
                        let top_indx=sub_groups.length
                        var ag_score_array=[];
                        for(var i=0;i<top_indx;i++){
                            ag_score_array.push(0);
                        }
                        for(var i=0;i<top_indx;i++){
                            let current_sb=sub_groups[i]
                            value.forEach((word)=>{
                                let tmp_array=Max_Bias_map.get(word);
                                tmp_array.forEach((obj)=>{
                                    let indx_sb= sub_groups.indexOf(obj.subgroup);
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
                            // if(Bias_Matrix[current_index][next_index]==0){
                                Bias_Matrix[current_index][next_index]= ag_score_array[top_indx-1]*1000;
                                Bias_Matrix[next_index][current_index]= ag_score_array[i-1]*1000;
                                Color_Matrix[current_index][next_index]= indx;
                                Color_Matrix[next_index][current_index]= indx;

                            // }
                            // else{
                            //     Bias_Matrix[current_index][next_index]+= ag_score_array[top_indx-1]*1000;
                            //     Bias_Matrix[next_index][current_index]+= ag_score_array[i-1]*1000;
                            // }

                        }
                        // put into bias id map
                        bias_id_map.set(key,indx);
                        
                        //per bias there will be one color
                        indx++;
                    }
            
                }

                // populte the type matrix for outer layer
                bias_types.forEach((obj)=>{
                    if(re_onclick_types.includes(obj.type)){
                        let type_idx=re_onclick_types.indexOf(obj.type);
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

                // console.log(bias_id_map);

                /////////////// Draw the chord diagram from the generated Matrix//////////////////////////

                // create a map to grab the word positions for rendering
                var position_map= new Map();
                var posY=0;

                // create a map with all words and their position created by d3 cluster
                root.children.forEach(function(obj){
                    if(!obj.children)
                        posY=obj.y;
                    position_map.set(obj.data.key,[obj.x,posY+60]);

                });
                // console.log(position_map)
        
                // Create the nodes/Texts for svg  for Chord diagram
                node = node
                .data(data.data)
                .enter().append("text")
                .attr("class", "node")
                .attr("dy", "0.21em")
                .attr("transform", function(d) { 
                    var str = d.split(".")[0];
                    var [pos_x,pos_y]=position_map.get(str);
                    return "rotate(" + (pos_x - 90) + ")translate(" + (pos_y + 8) + ",0)" + (pos_x < 180 ? "" : "rotate(180)"); 
                })
                .attr("text-anchor", function(d) { var str = d.split(".")[0]; var [pos_x,pos_y]=position_map.get(str); return pos_x < 180 ? "start" : "end"; })
                .attr("id", function(d) {var str = d.split(".")[0]; return "id"+str;})
                .attr("title",function(d){return d;})
                .text(function(d) { return d; })
                .on("click",function(d){
                })
                .on("mouseover",function(event,d){
                    d3.select(this).style('fill','#60a3d9');
                    var all_bias_this_word=perWord_Bias_map.get(d);
                    // Highlight related biases
                    all_bias_this_word.forEach((bias)=>{
                        
                        var id = bias_id_map.get(bias)
                        let id_name= "#id"+id;
                        d3.selectAll(id_name).style("opacity",1.0);
                    });
                })
                .on("mouseout",function(event,d){
                    d3.select(this).style('fill','#0a0b0c');
                    var all_bias_this_word=perWord_Bias_map.get(d);
                    // Highlight related biases
                    all_bias_this_word.forEach((bias)=>{
                        var id = bias_id_map.get(bias)
                        let id_name= "#id"+id;
                        d3.selectAll(id_name).style("opacity",0.3);
                    });
                });
                
                // uncomment this parto to create more colors
                // create random color for all biases
                // for(var i=0;i<50;i++){
                //     getColor(i)
                // }
                // console.log(colors);

                // arrays to save the width of each arc
                var arc_width_in=[]
                var arc_width_out=[]

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

                // Define the div for the tooltip
                var div = d3.select("body").append("div")	
                .attr("class", "tooltip")				
                .style("opacity", 0);

                // Generate percentage of each bias w.r.t all bias
                var percentage_bias=[];
                var all_sum=0;
                for(var i=0;i<Bias_Matrix.length;i++){
                    var this_sum=0;
                    for(var j=0;j<Bias_Matrix.length;j++){
                        this_sum+=Bias_Matrix[i][j];
                        all_sum+=Bias_Matrix[i][j];
                    }
                    percentage_bias.push(this_sum)
                }
                for(var i=0;i<percentage_bias.length;i++){
                    var new_val=(percentage_bias[i]/all_sum)*100;
                    percentage_bias[i]=new_val.toFixed(2)
                }



                // add the groups on the inner part of the circle
                svg_new
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
                .innerRadius(210)
                .outerRadius(245))
                .attr("id",function(d,i){ arc_width_in.push(d3.select(this).node().getBBox().width);return "group"+i;})
                .on("mouseover",function(event,d){
                    div.transition()		
                        .duration(200)		
                        .style("opacity", .9);	
                    div.html(re_onclick_subgroups[d.index]+"<br/><br/>"+"Associated Bias: "+percentage_bias[d.index]+"%")
                        .style("left", (d3.pointer(event,d3.select(event.currentTarget))[0]) + "px")		
                        .style("top", (d3.pointer(event,d3.select(event.currentTarget))[1] - 28) + "px");	
                })
                .on("mouseout", function(event,d) {		
                    div.transition()		
                        .duration(500)		
                        .style("opacity", 0);	
                });

                // add the super groups on the outer part of the circle
                svg_new
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
                .innerRadius(245)
                .outerRadius(270))
                .attr("id",function(d,i){arc_width_out.push(d3.select(this).node().getBBox().width);return "group_2"+i;})
                .on("mouseover",function(event,d){
                    div.transition()		
                        .duration(200)		
                        .style("opacity", .9);	
                    div.html(re_onclick_types[d.index])
                        .style("left", (d3.pointer(event,d3.select(event.currentTarget))[0]) + "px")		
                        .style("top", (d3.pointer(event,d3.select(event.currentTarget))[1] - 28) + "px");
                })
                .on("mouseout", function(event,d) {		
                    div.transition()		
                        .duration(500)		
                        .style("opacity", 0);	
                });

                // Add the links between groups
                svg_new
                .datum(res)
                .append("g")
                .selectAll("path")
                .data(function(d) {return d; })
                .enter()
                .append("path")
                .attr("d", d3.ribbon().radius(210))
                .attr("class", function(d){return "class"+Color_Matrix[d.source.index][d.target.index];})
                .attr("id", function(d) {var index_in_bias_map= Color_Matrix[d.source.index][d.target.index]; return "id"+index_in_bias_map;})
                .attr("fill", function(d,i){ 
                    // console.log(d);
                    return colors[Color_Matrix[d.source.index][d.target.index]]})
                .style("stroke", "black")
                .style("opacity",0.3)
                .on("mouseover",function(event,d){
                    d3.select(this).style("opacity",1.0);
                    var classname="."+d3.select(this).attr('class');
                    d3.selectAll(classname).style("opacity",1.0); 
                    // console.log(event); 
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
                    // console.log(related_words)
                    // Highlight those words
                    related_words.forEach((w)=>{
                        var str = w.split(".")[0];
                        let id_name= "#id"+str;
                        let this_color= d3.select(this).attr('fill');
                        d3.selectAll(id_name).style("fill",this_color).style("font-size","18px").style("font-weight","400");
                        // .style("font-weight","400");
                    });
                })
                .on("mouseout",function(event,d){
                    d3.select(this).style("opacity",0.3);
                    var classname="."+d3.select(this).attr('class');
                    d3.selectAll(classname).style("opacity",0.3);
                    // console.log(event)
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
                        var str = w.split(".")[0];
                        let id_name= "#id"+str;
                        d3.selectAll(id_name).style("fill","#495464").style("font-size","15px").style("font-weight","300");
                    });
                });
            
                // add labels
                svg_new.append("g").selectAll("text")
                .data(res.groups)
                .enter()
                .append("text")
                .attr("dx", 4)
                .attr("dy", 20)
                .append("textPath")
                .attr("class", "dotme")
                .attr("xlink:href", function(d) {return "#group" + d.index; })
                .text(function(d) { return re_onclick_subgroups[d.index]; })
                .attr("width",function(d,i){return arc_width_in[i];})
                .style("fill", "black")
                .style("opacity",0.9)
                .style("font-size","12px");
            

                // add labels for super groups
                svg_new.append("g").selectAll("text")
                .data(res2.groups)
                .enter().append("text")
                .attr("dx", 14)
                .attr("dy", 15)
                .append("textPath")
                .attr("class", "dotme")
                .attr("xlink:href", function(d) { return "#group_2" + d.index; })
                .text(function(d) { return re_onclick_types[d.index]; })
                .attr("width",function(d,i){return arc_width_out[i];})
                .style("fill", "black")
                .style("opacity",0.9)
                .style("font-size","12px");

                d3.selectAll('.dotme').call(dotme);
            }

        },
        [data,bias_dictionary,max_bias_scores]
    );

    return(
    <svg
    ref={ref}
    style={{
      height: "95%",
      width: "100%",
      margin:"0px",
      padding:"10px"
    }}
    >
    <g className=".node" />
    {/* <g className="x-axis" />
    <g className="y-axis" /> */}
  </svg>
    );
}
);

export default ChordChart;