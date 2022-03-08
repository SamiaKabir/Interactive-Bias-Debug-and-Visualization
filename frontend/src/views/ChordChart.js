import { useD3 } from '../hooks/useD3';
import React , { useEffect, useState }from 'react';
import * as d3 from 'd3';
import './ChordChart.css';


function ChordChart({ data }) {
    // Read in Bias types
    const [bias_types,setBias_types]=useState(0);
    useEffect(() => {
      d3.json("/bias_types").then((d) => {
        setBias_types(d);

      });
      return () => undefined;
    }, []);
    // console.log(bias_types);

    // Read in Bias Dictionary
    const [bias_dictionary,setBias_dictionary]=useState(0);
    useEffect(() => {
        d3.json("/bias_dictionary").then((d) => {
          setBias_dictionary(d);
        });
        return () => undefined;
    }, []);
    // console.log(bias_dictionary);


    // Read in Maximum individual and intersectional bias score
    const [max_bias_scores,set_max_bias_scores]=useState(0);
    useEffect(() => {
        d3.json("/max_bias_dictionary").then((d) => {
            set_max_bias_scores(d);
        });
        return () => undefined;
    }, []);
    // console.log(max_bias_scores);

    // generate a map of bias scores  and max bias scoresfor all words from the data from pyhton
    var Bias_map= new Map();
    var Max_Bias_map= new Map();

    // convert python dictionaries to JS map

    function convert_to_map(){
        Object.keys(bias_dictionary).map(function(key) {
            Bias_map.set(key,bias_dictionary[key])
        });
        console.log(Bias_map)

        Object.keys(max_bias_scores).map(function(key) {
            Max_Bias_map.set(key,max_bias_scores[key])
        });
        console.log(Max_Bias_map)

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
    

    const ref = useD3(
        (svg) => {
            // measurement for chord diagram svg
            const diameter_2 = 600;
            const radius_2 = diameter_2 / 2;
            const innerRadius_2 = radius_2 - 100;

            var cluster = d3.cluster()
                          .size([360, innerRadius_2]);


            convert_to_map();

            // Clear the svg to get rid off any previous chart
            svg.selectAll(".node").remove(); 
            svg.selectAll("g").remove();


            // Declare new nodes for chord diagram
            var node = svg.append("g").attr("transform", "translate(" + (radius_2+160) + "," + (radius_2+150)+ ")").selectAll(".node");

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
        



                // Create the nodes for svg  for Chord diagram
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
                .attr("id", function(d) { return "id"+d;})
                .attr("title",function(d){return d;})
                .text(function(d) { return d; });
                // .on("click", function(d){
                //     var clicked_word=d3.select(this).attr("title");
                //     scrollToPlot(clicked_word);
                // });

   


            }

            
            








        },
        [data]
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

export default ChordChart;