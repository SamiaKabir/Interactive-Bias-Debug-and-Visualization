
width_bar_plot= document.getElementById("barPlots").clientWidth;

// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

function drawBarPlots(d,bias_map){

    // Clear thhis div each time
    d3.select("#barPlots").selectAll("*").remove();

    // set the dimensions and margins of the graph
    var margin = {top: 15, right: 80, bottom: 80, left: 100},
    width = width_bar_plot - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

    // var top_label= d3.select("#barPlots")
    // .append("svg")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    // .attr("position","fixed")
    // .append("g")
    // .append("text")
    // .attr("x", 20)
    // .attr("y", 10)
    // .attr("font-size", 12)
    // .attr("style", "fill: green;")
    // .text("Gender");


    // console.log(bias_map)

    // An array to store all svgs
    let svgs=[];
    let svg_indx=0;
    d.data.similar_index.forEach((word)=>{
    svgs[svg_indx]= d3.select("#barPlots")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", function(d) { return "svg_"+word;})
    .append("g")
    .attr("transform",
            "translate(0 ," + margin.top + ")");


//    Associated word
    svgs[svg_indx].append("text")
    .attr("x", 2)
    .attr("y", 40)
    .attr("font-size", 12)
    .attr("style", "fill: green;")
    .text(word);


    // top labels 
    // Change it later to do it dynamically

    svgs[svg_indx].append("text")
    .attr("x", 200)
    .attr("y", 0)
    .attr("font-size", 12)
    .attr("style", "fill: #22577E;")
    .text("Gender");


    svgs[svg_indx].append("text")
    .attr("x", 550)
    .attr("y", 0)
    .attr("font-size", 12)
    .attr("style", "fill: #95D1CC;")
    .text("Race");

    svgs[svg_indx].append("text")
    .attr("x", 810)
    .attr("y", 0)
    .attr("font-size", 12)
    .attr("style", "fill: #1F1D36;")
    .text("Income-Level");


    //  X axis
    var x = d3.scaleBand()
    .range([ 0, (width) ])
    .domain(bias_map.get(word).map(function(d) { return d.subgroup; }))
    .padding(0.9);
    svgs[svg_indx].append("g")
    .attr("transform", "translate("+ margin.left +"," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

    //  This scale produces negative output for negatve input 
    var yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, height]);

    let score_max=Math.max.apply(Math, bias_map.get(word).map(function(obj) { return obj.bias_score; }))
    let score_min=Math.min.apply(Math, bias_map.get(word).map(function(obj) { return obj.bias_score; }))  
    if (score_min>=0) {
        score_min=0
    }   
    // Add Y axis
    var y = d3.scaleLinear()
    .domain([-1, 1])
    .range([ height-yScale(-1), 0]);
    svgs[svg_indx].append("g")
    .attr("transform", "translate("+ margin.left +",0)")
    .call(d3.axisLeft(y));

    // Bars
    svgs[svg_indx].selectAll("mybar")
    .data(bias_map.get(word))
    .enter()
    .append("rect")
    .attr("transform", "translate("+ margin.left +",0)")
    .attr("x", function(d) { return x(d.subgroup); })
    .attr("y", function(d) { return height - Math.max(0, yScale(d.bias_score)); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return Math.abs(yScale(d.bias_score)); })
    .attr("fill",function(d){
      if(d.type=="Gender")
        return "#22577E";

      else if(d.type=="Race"){
          return "#95D1CC";
      }

      else if(d.type=="Income"){
          return "#1F1D36";
      }

    } )
    .on("mouseover",function(d){		
        div.transition()		
            .duration(200)		
            .style("opacity", .9);		
        div.html(d.bias_score.toFixed(4))
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
        })
    .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    });

    svg_indx++;

    });

}

// Scroll to the barchart for the clicked word

function scrollToPlot(d){
    let svg_id= "svg_"+d

    var contentElement = document.getElementById(svg_id)

    contentElement.scrollIntoView();

}