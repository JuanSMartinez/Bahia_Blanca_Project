(function(){
    
    //BEGIN: Read json***************************************************************************
    d3.json("json/buses_final_passenger.json", function(errorP, dataP){
    d3.json("json/buses_final_velocity.json", function(error, data){
        
       if(error || errorP){
           throw error;
       }
       
        
    //BEGIN: Global parameters*****************************************************************************
    
        
    //Bus id range
    var idRange = ["319", "500", "502", "502 extension", "503", "504", "505", "506", "507", "509", "512", "513", "513 expreso", "514", "516", "517", "518", "519", "519a"];
        
    //SVG
    var width =1300;
    var height = 725;
    var margin = {top: 20, left: 20, right: 20, bottom: 20};
    var effWidth = width - margin.left - margin.right;
    var effHeight = height - margin.top - margin.bottom;
    var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
        
    //Round slider radius
    var rMonth = 100;
    var rDay = 60;    
        
    //Shift for round sliders due to text
    var radialDelta = 125;
        
    //Shift of horiozon charts
    var horizonDelta = 20;
        
    //Width of horizon charts
    var hWidth = (effWidth - (2*rMonth+radialDelta))/2 - horizonDelta;
        
    //Holidays text container
    var txtSize = 20
    var holydayContainer = svg.append("g");
    var dayType = holydayContainer.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top + 2*txtSize)
        .attr("font-family", "Arial")
        .attr("font-size", txtSize + "px")
        .text("Día: Normal");
    var dayDesc = holydayContainer.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top + 4*txtSize)
        .attr("font-family", "Arial")
        .attr("font-size", txtSize + "px")
        .attr("dy",0)
        .text("").call(wrap, 2*radialDelta);
        
    var hoverInfoContainer = svg.append("g").attr("transform", "translate(0,"+(effHeight/2+165)+")");
    var busLineHovered = hoverInfoContainer.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top + 2*txtSize)
        .attr("font-family", "Arial")
        .attr("font-size", txtSize + "px")
        .text("Linea:");
    var hourHovered = hoverInfoContainer.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top + 4*txtSize)
        .attr("font-family", "Arial")
        .attr("font-size", txtSize + "px")
        .attr("dy",0)
        .text("Hora:");
    var chartHovered = hoverInfoContainer.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top + 6*txtSize)
        .attr("font-family", "Arial")
        .attr("font-size", txtSize + "px")
        .attr("dy",0)
        .text("Gráfica enfocada:");
    var avgHovered = hoverInfoContainer.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top + 8*txtSize)
        .attr("font-family", "Arial")
        .attr("font-size", txtSize + "px")
        .attr("dy",0)
        .text("Promedio:");
        
    //Velocity chart container
    var velocityContainer = svg.append("g").attr("transform", "translate("+(2*rMonth+radialDelta + horizonDelta/2)+","+effHeight/2+")");
    var velocityContainers = [];
    var velocityHoverRect = svg.append("g").append("rect")
        .attr("x", (2*rMonth+radialDelta + horizonDelta/2))
        .attr("width", hWidth)
        .attr("y", effHeight/2)
        .attr("height", effHeight)
        .style("opacity", 0);
    var cursorLineV = svg.append("g")
            .append("line")
            .attr("x1", (2*rMonth+radialDelta + horizonDelta/2))
            .attr("y1", effHeight/2)
            .attr("x2", (2*rMonth+radialDelta + horizonDelta/2))
            .attr("y2", effHeight)
            .style("stroke-width", 1)
            .style("stroke", "black")
            .style("fill", "none")
            .on("click", function(){clickedLatLng(d3.mouse(this)[0],d3.mouse(this)[1], (2*rMonth+radialDelta + horizonDelta/2), "Velocidad");});
    velocityHoverRect.on("mousemove", function(){
        cursorLineV.attr("x1", d3.mouse(this)[0] );
        cursorLineV.attr("x2", d3.mouse(this)[0] );
        showHoverValues(d3.mouse(this)[0],d3.mouse(this)[1], (2*rMonth+radialDelta + horizonDelta/2), 0);
    });
        
    //People container
    var peopleContainer = svg.append("g").attr("transform", "translate("+(2*rMonth+radialDelta+hWidth + horizonDelta)+","+effHeight/2+")");
    var peopleContainers = [];
    var peopleHoverRect = svg.append("g").append("rect")
            .attr("x", (2*rMonth+radialDelta+hWidth + horizonDelta))
            .attr("width", hWidth)
            .attr("y", effHeight/2)
            .attr("height", effHeight)
            .style("opacity", 0);
    var cursorLineP = svg.append("g")
            .append("line")
            .attr("x1", (2*rMonth+radialDelta+hWidth + horizonDelta))
            .attr("y1", effHeight/2)
            .attr("x2", (2*rMonth+radialDelta+hWidth + horizonDelta))
            .attr("y2", effHeight)
            .style("stroke-width", 1)
            .style("stroke", "black")
            .style("fill", "none")
            .on("click",function(){clickedLatLng(d3.mouse(this)[0],d3.mouse(this)[1], (2*rMonth+radialDelta + horizonDelta + hWidth), "Pasajeros");});
    peopleHoverRect.on("mousemove", function(){
        cursorLineP.attr("x1", d3.mouse(this)[0] );
        cursorLineP.attr("x2", d3.mouse(this)[0] );
        showHoverValues(d3.mouse(this)[0],d3.mouse(this)[1], (hWidth+2*rMonth+radialDelta + horizonDelta), 1);
    });
        
    //Map container
    var rawPercentageWidth = (innerWidth - (2*rMonth+radialDelta + innerWidth - effWidth+20))/innerWidth;
    var widthPercentage = Math.floor(100*rawPercentageWidth);
    var rawPercentageHeight = ((height)/2-40)/innerHeight;
    var heightPercentage = Math.floor(100*rawPercentageHeight);
    
    
    var mapContainer = d3.select("body").append("div").attr("id","map");
    mapContainer
        .style("width",  widthPercentage+"%")
        .style("height",heightPercentage + "%")
        .style("left", (2*rMonth+radialDelta+ horizonDelta) + "px");
    var map = L.Mapzen.map('map');
    map.setView([-38.717530, -62.265174], 12);  
    var markers = new L.FeatureGroup();
    var marker = L.marker([-38.717530, -62.265174]);
    markers.addLayer(marker);
    map.addLayer(markers);

    //Chart 
    var bands = 2;
    var numberOfCharts = 19;
    var chartHeight = effHeight/(2*numberOfCharts) - 2;
    var chart = d3.horizon()
                    .width(hWidth)
                    .height(chartHeight)
                    .bands(bands)
                    .mode("offset")
                    .curve(d3.curveMonotoneX)
                    .colors(["#fac173", "#ffa310", "#1877e5", "#1ad5f7"]);
        
    //Bus names container
    var busNamesContainer = svg.append("g").attr("transform", "translate("+(2*rMonth+radialDelta + horizonDelta/2)+","+effHeight/2+")");
    idRange.forEach(function(id, i){
        busNamesContainer.append("text")
                            .attr("x", 0)
                            .attr("y", i*(chartHeight+2) + 12)
                            .attr("font-family", "Arial")
                            .attr("font-size", 12 + "px")
                            .text(id);
        busNamesContainer.append("text")
                            .attr("x", hWidth + horizonDelta/2)
                            .attr("y", i*(chartHeight+2) + 12)
                            .attr("font-family", "Arial")
                            .attr("font-size", 12 + "px")
                            .text(id);
    });

        
    //Horizontal time scale
    //var halfHourScale = d3.scaleLinear().domain([0, 4]).range([0, hWidth]);
    var halfHourScale = d3.scaleTime().domain([new Date, new Date])
                        .nice(d3.timeDay)
                        .range([0, hWidth]);
    //Horizontal axis
    var xAxisVel = d3.axisBottom(halfHourScale).ticks(d3.timeMinute.every(30)).tickFormat(d3.timeFormat("%H:%M"));
    var xAxisVelG = svg.append("g").attr("transform","translate("+(2*rMonth+radialDelta + horizonDelta/2)+","+(effHeight/2+(numberOfCharts*(chartHeight+2)))+")")
    .call(xAxisVel).selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start");
        
    var xAxisPeopleG = svg.append("g").attr("transform","translate("+(2*rMonth+radialDelta+hWidth + horizonDelta)+","+(effHeight/2+(numberOfCharts*(chartHeight+2)))+")")
    .call(xAxisVel).selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start");
        
    //Filtered data
    var avgV=[];
    var avgP=[];
    var filtered;
    var filetredP;
    var filteredDateV;
    var filteredDateP;
    var filteredLatLongV;
    var filteredLatLongP;
        
    //Localization data
    var localizationData;
    
    //END: Global parameters*****************************************************************************
    
    //BEGIN: Generate control sliders*****************************************************************************
    
    //Hour range
    var hours = d3.range(0,48,1);
    
    //Month range
    var monthRange = ["Enero", "Febrero", "Marzo", "Abril", "Mayo",
                        "Junio", "Julio", "Agosto", "Septiembre", 
                     "Octubre", "Noviembre", "Diciembre"];
    
    //Day range
    var dayRange = d3.range(1,32,1);
    
    //Year range
    var yearRange = [2010,2011,2012,2013,2014,2015,2016];
    
    //Selected  year, month and day
    var year = 2013;
    var month = 10;
    var day = 24;
    
    //Horizontal slider
    function hSlider(array, height, width, x, y){
        
        var delta = width/(array.length-1);
        var linearRange = d3.range(0, width+1, delta);
        var container = svg.append("g").attr("class", "control").attr("transform", "translate(" + x + "," + y +")");
       
        var line = container.append('line')
        .attr('x1', -width/2)
        .attr('y1', height/2 )
        .attr('x2', width/2)
        .attr('y2', height/2)
        .style("stroke-width", 2)
        .style("stroke", "steelblue")
        .style("fill", "none");
        var drag = d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended);
        
        var lines = container.append("g")
                .selectAll('lines')
                .data(linearRange).enter().append("line")
                .attr("x1", function(d) { return d-width/2; })
                .attr("y1", function(d) { return height/2-5; })
                .attr("x2", function(d) { return d-width/2; })
                .attr("y2", function(d) { return height/2+5; })
                .style("stroke-width", 1)
                .style("stroke", "black")
                .style("fill", "none");
        
        handle = [{
          x: 0,
          y: height/2
        }];
        
        handle_circle = container.append("g")
          .attr("class", "dot")
            .selectAll('circle')
          .data(handle)
            .enter().append("circle")
          .attr("r", 5)
          .attr("cx", function(d) { return d.x;})
          .attr("cy", function(d) { return d.y;})
          .call(drag);
        
        
        
       var txt = container.append("g")
                .selectAll('labels')
                .data(linearRange).enter().append("text")
                .attr("style","text-anchor: middle")
                .attr("x", function(d) { return d-width/2; })
                .attr("y", height/2-10)
                .text( function (d) { return array[linearRange.indexOf(d)]; })
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px")
                .attr("fill", "black");
                //.attr("transform", function(d){return rotate(d);});
        
        
        function closestTag(x){
            
            var closestTag;
            var distance;
            var closestPos;
            linearRange.forEach(function(xc){
                
                if(distance == undefined || Math.abs(xc-x) < distance){
                    distance = Math.abs(xc-x);
                    closestTag = array[linearRange.indexOf(xc)];
                    closestPos = xc;
                }
            });
            return [closestTag, closestPos];
        }
        
        function dragstarted(d) {
          d3.event.sourceEvent.stopPropagation();
          d3.select(this)
            .classed("dragging", true);
        }

        function dragged(d) { 
            var pos;
            if (d3.event.x > width/2)
                pos = width/2;
            else if(d3.event.x < -width/2)
                pos = -width/2;
            else
                pos = d3.event.x;
            year = closestTag(pos + width/2)[0];
            var position = closestTag(pos + width/2)[1]
            d3.select(this)
            .attr("cx", d.x = position-width/2);
            
        }

        function dragended(d) {
          d3.select(this)
            .classed("dragging", false);
            filterData(data, dataP);
            update(); 
            
            
        }
    }
    
    //Round sliders
    function slider(circumference_r, array, type, width, height, x, y){
       
        var delta = 2*Math.PI/(array.length);
        var angularRange = d3.range(0, 2*Math.PI, delta);
        
        var drag = d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended);
    
        var container = svg.append("g").attr("class", "control").attr("transform", "translate(" + x + "," + y + ")");
        var circumference = container.append('circle')
        .attr('r', circumference_r)
        .attr('class', 'slider');
        
        var line = container.append("g")
                .selectAll('lines')
                .data(angularRange).enter().append("line")
                .attr("x1", function(d) { return getX1(d); })
                .attr("y1", function(d) { return getY1(d); })
                .attr("x2", function(d) { return getX2(d); })
                .attr("y2", function(d) { return getY2(d); })
                .style("stroke-width", 1)
                .style("stroke", "black")
                .style("fill", "none");

        handle = [{
          x: 0,
          y: -circumference_r
        }];

        handle_circle = container.append("g")
          .attr("class", "dot")
            .selectAll('circle')
          .data(handle)
            .enter().append("circle")
          .attr("r", 5)
          .attr("cx", function(d) { return d.x;})
          .attr("cy", function(d) { return d.y;})
          .call(drag);
        
        var txt = container.append("g")
                .selectAll('labels')
                .data(angularRange).enter().append("text")
                .attr("style", function(d){return anchor(d);})
                .attr("x", function(d) { return getX(d); })
                .attr("y", function(d) { return getY(d); })
                .text( function (d) { return array[angularRange.indexOf(d)]; })
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px")
                .attr("fill", "black")
                .attr("transform", function(d){return rotate(d);});
        
        
        
        function anchor(alpha){
            var cos = Math.round(Math.cos(alpha) * 1000) / 1000;
            if(Math.sign(cos) >= 0)
                return "text-anchor: start";
            else if(Math.sign(cos) < 0)
                return "text-anchor: end";
        }
        
        function rotate(alpha){
            var cos = Math.round(Math.cos(alpha) * 1000) / 1000;
            var sgncos = Math.sign(cos);
            var angle = sgncos >= 0 ? alpha*180/Math.PI : sgncos*(180 - alpha*180/Math.PI);
            return "rotate(" + angle +","+getX(alpha)+","+getY(alpha)+")";
        }
        
        function getX1(alpha){
            var cos = Math.cos(alpha);
            return (circumference_r-5)*cos
        }
        
        function getY1(alpha){
            var sin = Math.sin(alpha);
            return (circumference_r-5)*sin
        }
        
        function getX2(alpha){
            var cos = Math.cos(alpha);
            return (circumference_r+5)*cos;
        }
        
        function getY2(alpha){
            var sin = Math.sin(alpha);
            return (circumference_r+5)*sin
        }
        
        function getX(alpha){
            var cos = Math.cos(alpha - (5/circumference_r)*Math.PI/180);
            return (circumference_r+5)*cos
        }
        
        function getY(alpha){
            var sin = Math.sin(alpha - (10/circumference_r)*Math.PI/180);
            return (circumference_r+10)*sin
        }
        
        function closestTag(alpha){
            var closestTag;
            var closestAngle;
            var distance;
            angularRange.forEach(function(angle){
                if(distance == undefined || Math.abs(alpha-angle) < distance){
                    distance = Math.abs(alpha-angle);
                    closestTag = array[angularRange.indexOf(angle)];
                    closestAngle = angle;
                }
            });
            
            return [closestTag, closestAngle];
        }

        function dragstarted(d) {
          d3.event.sourceEvent.stopPropagation();
          d3.select(this)
            .classed("dragging", true);
        }

        function dragged(d) {  
            d_from_origin = Math.sqrt(Math.pow(d3.event.x,2)+Math.pow(d3.event.y,2));
            alpha = Math.acos(d3.event.x/d_from_origin);
            var angle;
            var x = d3.event.x;
            var y = d3.event.y;
            if(y < 0){
                angle = 2*Math.PI - alpha;
            }
            else{
                angle = alpha;    
            }
            if(type=="month"){
                month = array.indexOf(closestTag(angle)[0]) + 1;
                
            }
            else if(type=="day"){
                day = closestTag(angle)[0];
                
            }
            var closestAngle = closestTag(angle)[1];
            d3.select(this)
            .attr("cx", d.x = circumference_r*Math.cos(closestAngle))
            .attr("cy", d.y = circumference_r*Math.sin(closestAngle));
            
        }

        function dragended(d) {
          d3.select(this)
            .classed("dragging", false);
            filterData(data, dataP);
            update();
        }
    }
    
    //Generate sliders
    slider(rMonth, monthRange, "month", 2*rMonth+radialDelta, effHeight/8, rMonth + radialDelta/2 , effHeight/2);
    slider(rDay, dayRange, "day", 2*rDay+radialDelta, effHeight/8 , rMonth + radialDelta/2 , effHeight/2);
    hSlider(yearRange, effHeight/8, effWidth/5, rMonth + radialDelta/2, effHeight/2+125);
    
    //END: Generate control sliders*****************************************************************************
    
    //BEGIN: Filter data*****************************************************************************
    
    function filterData(dataVelocity, dataPeople){
        
        //Reset averages
        avgP=[];
        avgV=[];

        //Filter by date    
        filteredDateV = dataVelocity.map(function(d){
            if (d["Anio"] == year && d["Mes"] == month && d["Dia"] == day)
                return d;
        });
        filteredDateP = dataPeople.map(function(d){
            if (d["Anio"] == year && d["Mes"] == month && d["Dia"] == day)
                return d;
        });
        
        //Filter velocity
        arrayV = [];
        arrayLatLongV = [];
        for(var i = 0; i < numberOfCharts; i++){
            velocityLine = [];
            avg = 0;
            velocities = [];
            pairOfPairs = [];
            for(var j = 0; j < 48; j++){
                y = getVelocityOfPoint(i,j,filteredDateV)
                velocities.push(y);
                avg += y;
            }
            avg = avg/48;
            avgV.push(avg);
            for(var j = 0; j < 48; j++){
                velocityLine.push([j,velocities[j] - avg]);
                pairs = getLatLongVelocity(i,j,filteredDateV);
                pairOfPairs.push(pairs);
            }
            arrayV.push(velocityLine);
            arrayLatLongV.push(pairOfPairs);
        }
        filtered = arrayV;
        filteredLatLongV = arrayLatLongV;
        
        //Filter people
        arrayP = [];
        arrayLatLongP = [];
        for(var i = 0; i < numberOfCharts; i++){
            peopleLine = [];
            avg = 0;
            people = [];
            pairOfPairs = [];
            for(var j = 0; j < 48; j++){
                y = getPeopleInPoint(i,j,filteredDateP)
                people.push(y);
                avg += y;
            }
            avg = avg/48;
            avgP.push(avg);
            for(var j = 0; j < 48; j++){
                peopleLine.push([j,people[j] - avg]);
                pairs = getLatLongPeople(i,j,filteredDateP);
                pairOfPairs.push(pairs);
            }
            arrayP.push(peopleLine);
            arrayLatLongP.push(pairOfPairs);
        }
        filteredP = arrayP;
        filteredLatLongP = arrayLatLongP;
    }
    
    function getVelocityOfPoint(lineIndex, halfHourIndex, filteredDateV){
        //line name
        var line = idRange[lineIndex];
        
        //Hour and minute
        var hour = Math.floor((halfHourIndex+1)/2);
        var minute = ((halfHourIndex+1)%2)*30;
        
        var averageVelocity = 0;
        var count = 0;
        filteredDateV.forEach(function(object){
            if(object){
               if(object["Minuto"] == minute && object["Hora"] == hour && object["Linea"] == line){
                   averageVelocity += object["Velocidad"];
                   count += 1;
               } 
            }
        });
        return count == 0 ? 0 : averageVelocity/count;
    }
        
    function getPeopleInPoint(lineIndex, halfHourIndex, filteredDateP){
        //line name
        var line = idRange[lineIndex];
        
        //Hour and minute
        var hour = Math.floor((halfHourIndex+1)/2);
        var minute = ((halfHourIndex+1)%2)*30;
        
        var averagePeople = 0;
        var count = 0;
        filteredDateP.forEach(function(object){
            if(object){
               if(object["Minuto"] == minute && object["Hora"] == hour && object["Linea"] == line){
                   averagePeople += object["Pasajeros"];
                   count += 1;
               } 
            }
        });
        return count == 0 ? 0 : averagePeople/count;
    }
        
    function getLatLongVelocity(lineIndex, halfHourIndex, filteredDateV){
        //line name
        var line = idRange[lineIndex];
        
        //Hour and minute
        var hour = Math.floor((halfHourIndex+1)/2);
        var minute = ((halfHourIndex+1)%2)*30;
        
        var pairs = [];
        filteredDateV.forEach(function(object){
            if(object){
               if(object["Minuto"] == minute && object["Hora"] == hour && object["Linea"] == line){
                   pairs.push([object["Latitud"], object["Longitud"]])
               } 
            }
        });
        return pairs;
    }
        
    function getLatLongPeople(lineIndex, halfHourIndex, filteredDateP){
        //line name
        var line = idRange[lineIndex];
        
        //Hour and minute
        var hour = Math.floor((halfHourIndex+1)/2);
        var minute = ((halfHourIndex+1)%2)*30;
        
        var pairs = [];
        filteredDateP.forEach(function(object){
            if(object){
               if(object["Minuto"] == minute && object["Hora"] == hour && object["Linea"] == line){
                   pairs.push([object["Latitud"], object["Longitud"]])
               } 
            }
        });
        return pairs;
    }
    
    //END: Filter data*****************************************************************************************
    
    //BEGIN: Get position values from clicked data in the horizon charts **************************************
    var line = false;
    var polyline;
    function clickedLatLng(x, y, xShift, parameter){
        
        var linePosition = Math.floor((y - effHeight/2)/(chartHeight+2));
        var halfHourSize = hWidth/48;
        var halfHourPosition = Math.floor((x - xShift)/halfHourSize);
        
        if(parameter == "Velocidad"){
            //Set marker
            var latLong = filteredLatLongV[linePosition][halfHourPosition][0];
            markers.removeLayer(marker);
            marker = L.marker(latLong);
            markers.addLayer(marker);
            
            //Flatten array
            var original = filteredLatLongV[linePosition];
            var flattened = [];
            for(var i = 0; i < 48; i ++){
                var array = original[i];
                for(var j = 0; j < array.length; j++)
                    flattened.push(array[j]);
            }
            if(line)
                map.removeLayer(polyline);
            polyline = L.polyline(flattened, {color: 'red'}).addTo(map);
            line=true;
        }
        else{
            //Set marker
            var latLong = filteredLatLongP[linePosition][halfHourPosition][0];
            markers.removeLayer(marker);
            marker = L.marker(latLong);
            markers.addLayer(marker);
            
            //Flatten array
            var original = filteredLatLongP[linePosition];
            var flattened = [];
            for(var i = 0; i < 48; i ++){
                var array = original[i];
                for(var j = 0; j < array.length; j++)
                    flattened.push(array[j]);
            }
            if(line)
                map.removeLayer(polyline);
            polyline = L.polyline(flattened, {color: 'red'}).addTo(map);
            line=true;
        }
        
    }
        
    function showHoverValues(x, y, xShift, type){
       
        var linePosition = Math.floor((y - effHeight/2)/(chartHeight+2));
        var halfHourSize = hWidth/48;
        var halfHourPosition = Math.floor((x - xShift)/halfHourSize);
        var halfHour = filtered[linePosition][halfHourPosition][0];
        
        busLineHovered.text("Linea: " + idRange[linePosition]);
        hourHovered.text("Hora: " + Math.floor((halfHour+1)/2) + ":" + (((halfHour+1)%2)*30));
        if(type == 0 ){
            chartHovered.text("Gráfica enfocada: Velocidad");
            avgHovered.text("Promedio: " + Math.round(100*avgV[linePosition])/100 + " km/h");
        }
        else{
            chartHovered.text("Gráfica enfocada: Personas");
            avgHovered.text("Promedio: " + Math.floor(avgP[linePosition]) + " persona(s)");
        }
        
    }
    
    //END: Get position values from clicked data in the horizon charts ****************************************    
        
    //BEGIN: Update of horizon charts***************************************************************************
    
    function update(){
        markers.removeLayer(marker);
        marker = L.marker([-38.717530, -62.265174]);
        markers.addLayer(marker);
        if(polyline)
            map.removeLayer(polyline);
        if(velocityContainers.length == 0){
            filtered.forEach(function(array, i){
                var g = velocityContainer.append("g").attr("class","containerGV");
                velocityContainers.push(g);
            });
        }
        if(peopleContainers.length == 0){
            filtered.forEach(function(array, i){
                var g = peopleContainer.append("g").attr("class","containerGP"); 
                peopleContainers.push(g);
            });
        }
        
        filtered.forEach(function(array, i){
            
            //Join
            var chartIV = velocityContainers[i].selectAll("g").data([array]);
            
            //Update
            chartIV.attr("class","chart")
                .attr("transform", "translate(0,"+i*(chartHeight+2)+")")
                .call(chart.duration(2000));
        
            //Enter
            chartIV.enter().append("g")
                .attr("class","chart")
                .attr("transform", "translate(0,"+i*(chartHeight+2)+")")
                .call(chart.duration(2000));                                                              
        });
        
        filteredP.forEach(function(array, i){
            
            //Join
            var chartIP = peopleContainers[i].selectAll("g").data([array]);
            
            //Update
            chartIP.attr("class","chart")
                .attr("transform", "translate(0,"+i*(chartHeight+2)+")")
                .call(chart.duration(2000));
        
            //Enter
            chartIP.enter().append("g")
                .attr("class","chart")
                .attr("transform", "translate(0,"+i*(chartHeight+2)+")")
                .call(chart.duration(2000));                                                               
        });
        
        //Determine if the day is a holyday
        d3.json("json/"+year+".json", function(error, data){
            if(!error){
                var found = false;
                data.forEach(function(obj){
                    if(obj.dia == day && obj.mes == month){
                        dayType.text("Día: Festivo");  
                        dayDesc.text("Motivo: " + obj.motivo).call(wrap, radialDelta*2);
                        found = true;
                    }
                });
                if(!found){
                        d3.json("json/fijos.json", function(error, data){
                        if(!error){
                            var found = false;
                            data.forEach(function(obj){
                                if(obj.dia == day && obj.mes == month){
                                    dayType.text("Día: Festivo");  
                                    dayDesc.text("Motivo: " + obj.motivo).call(wrap, radialDelta*2);
                                    found = true;
                                }
                                if(!found){
                                    dayType.text("Día: Normal");  
                                    dayDesc.text("");
                                }

                            });
                        }
                    });
                }
            } 
        });
        
        
    }
        
    //END: Update of horizon charts*****************************************************************************
    
    //BEGIN: Text wrapping from Mike Bostock ******************************************************************  
        
    function wrap(text, width) {
      text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", margin.left).attr("y", y).attr("dy", dy + "em");
  
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", margin.left).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
          }
        }
      });
    }
        
    //END: Text wrapping from Mike Bostock ******************************************************************  
        
       filterData(data, dataP)  
       update()
    });
    });
    //END: Read json*****************************************************************************

})();