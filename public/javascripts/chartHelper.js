// ====================================================================================================================
// Public Functions
// ====================================================================================================================

let modifyTimeout = null
let zoomToValues = {}

const getConfig = function(id, type, title, subtitle, modelData, extraData) {
    let {max, min, units} = extraData || {}

    let config = {
        "graphset": [
            {
                "border-color": "#cccccc",
                "border-radius": 5,
                "border-width": 1,
                "crosshairX": {
                    "line-color": "#555",
                    "marker": {
                        "border-color": "#fff",
                        "border-width": 1,
                        "size": 5
                    },
                    "plot-label": {
                        "background-color": "#fff",
                        "border-radius": 2,
                        "border-width": 2,
                        "multiple": true
                    }
                },
                "plot": {
                    "animation": {
                        "delay": "0",
                        "effect": "1",
                        "method": "4",
                        "sequence": "2"
                    },
                    "aspect": "spline"
                },
                "plotarea": {
                    "margin": "dynamic"
                },
                "scale-y": {
                    "guide": {
                        "line-style": "solid"
                    }
                },
                "subtitle": {
                    "adjust-layout": true,
                    "align": "left",
                    "text": subtitle
                },
                "title": {
                    "adjust-layout": true,
                    "align": "left",
                    "margin-left": "15%",
                    "text": title
                },
                "tooltip": {
                    "visible": false
                },
                "type": type,
                "utc": true
            }
        ],
        "gui": {
            "context-menu": {
                "alpha": 0.9,
                "button": {
                    "visible": true
                },
                "docked": true,
                "item": {
                    "text-alpha": 1
                },
                "position": "right"
            }
        }
    }

    if (type === 'area') {
        config = getAreaConfig(id, config, modelData)
    } else if (type === 'bar') {
        config = getBarConfig(config, modelData)
    } else if (type === 'gauge') {
        config = getGaugeConfig(config, modelData, max, min)
    } else if (type === 'line') {
        config = getLineConfig(id, config, modelData, units)
    } else if (type === 'pie') {
        config = getPieConfig(id, config, modelData, min, max)
    }

    return config
}


const modify = function(p) {
    if (p.id.match(/.*-cont$/))
        modifyCon(p)
    else if (p.id.match(/.*-action-time$/))
        modifyActions(p)
}

// ====================================================================================================================
// Private functions
// ====================================================================================================================

const getAreaConfig = function(id, config, values) {
    let localValues = values.slice()
    localValues.reverse()
    localValues.push({ "timestamp": new Date() })

    let series = [[new Date(localValues[0].timestamp).getTime()]]

    let markers = []

    localValues.reduce(function(prev, curr) {
        let dateCurr = new Date(curr.timestamp).getTime()
        let datePrev = new Date(prev.timestamp).getTime()

        let colors = {
            'PAUSE': 'orange',
            'RESUME': 'green',
            'START': 'green',
            'STOP': 'red'
        }

        markers.push({
            "background-color": colors[prev.value],
            "range": [datePrev, dateCurr],
            "type": "area",
            "value-range": true
        })

        series.push([dateCurr])

        return curr
    })
    series.push([new Date().getTime()])

    zoomToValues[id] = [series[series.length - 1][0] - 1 * 24 * 60 * 60 * 1000, series[series.length - 1][0]]  // Show the last day

    config['graphset'][0]['preview'] = {
        "adjust-layout": true,
        "live": true
    }
    config['graphset'][0]['scale-x'] = {
        "markers": markers,
        "transform": {
            "all": "%d/%m/%Y<br>%H:%i:%s",
            "type": "date"
        },
        "zoom-to-values": zoomToValues[id],
        "zooming": true
    }
    config['graphset'][0]['scale-y'] = {
        "label": {
            "text": "acciones"
        },
        "values": "0:1:1"
    }
    config['graphset'][0]['series'] = [
        {
            "text": "",
            "rules": [{
                "line-width": "0px",
                "rule": "%v < 1"
            }],
            "values": series
        }
    ]
    config['graphset'][0]['timezone'] = new Date().getTimezoneOffset() / (-60)

    return config
}

const getBarConfig = function(config, values) {
    values = values.map((value) => value.value)
    let order = getDataOrder(values)
    if (order >= 0) {
        values = values.map((value) => +Math.round(value))
    } else {
        values = values.map((value) => +Math.round(value * Math.pow(10, -order)) / Math.pow(10, -order))
    }
    plot = group(values)

    config['graphset'][0]['plot']['aspect'] = "histogram"
    config['graphset'][0]['scale-y']['label'] = {
        "text": "repeticiones"
    }
    config['graphset'][0]['series'] = [{
        "text": "",
        "values": plot
    }]
    delete(config['graphset'][0]['utc'])

    return config
}

const getGaugeConfig = function(config, modelData, max, min) {
    modelData = modelData.length > 1 ? [+average(modelData).toFixed(2)] : modelData

    config['graphset'][0]['plot'] = {
        "animation": {
            "delay": "0",
            "effect": "3",
            "method": "5",
            "sequence": "1"
        },
        "csize": "14%",
        "tooltip": {
            "visible": false
        },
        "size": "56%"
    }
    config['graphset'][0]['scale'] = {
        "size-factor": 0.9
    }
    config['graphset'][0]['scaleR'] = {
        "aperture": 290,
        "center": {
            "visible": false
        },
        "item": {
            "visible": false
        },
        "ring": {
            "background-color": "#C1C1C1",
            "size": 20
        },
        "tick": {
            "visible": false
        },
        "values": `${min}:${max}:${(max - min) / 10}`
    }
    config['graphset'][0]['scale-2'] = {
        "size-factor": 0.55
    }
    config['graphset'][0]['scale-r-2'] = {
        "aperture": 290,
        "center": {
            "background-color": "#BEBEBE",
            "border-color": "#5F5F5F",
            "border-width": 1,
            "size": 14
        },
        "item": {
            "font-size": 16,
            "offsetR": -1
        },
        "label": {
            "text": "text"
        },
        "minor-tick": {
            "line-color": "#C1C1C1",
            "placement": "inner",
            "size": 7
        },
        "minor-ticks": 4,
        "ring": {
            "visible": false
        },
        "tick": {
            "line-color": "#5F5F5F",
            "line-width": 4,
            "placement": "outter",
            "size": 15
        },
        values: `${min}:${max}:${(max - min) / 10}`
    }
    config['graphset'][0]['series'] = [{
        "background-color": "#F8B237",
        "value-box": {
            "font-color": "#515151",
            "font-size": 28,
            "offset-y": 40,
            "placement": "center",
            "text": "%v"
        },
        "values": modelData
    }]
    config['graphset'][0]['subtitle']['y'] = '60%'
    config['graphset'][0]['subtitle']['align'] = 'center'
    config['graphset'][0]['title']['y'] = '75%'
    config['graphset'][0]['title']['align'] = 'center'

    delete(config['gui'])

    return config
}

const getLineConfig = function(id, config, values, units) {
    plot = values.map(function(value) {
        return [new Date(value.timestamp).getTime(), +value.value]
    }).reverse()
    values = plot.map((value) => value[1])

    zoomToValues[id] = [plot[plot.length - 1][0] - 1 * 24 * 60 * 60 * 1000, plot[plot.length - 1][0]]  // Show the last day

    config['graphset'][0]['legend'] = {
        "background-color": "transparent",
        "border-width": 0,
        "draggable": true,
        "header": {
            "background-color": "#f0f0f0",
            "text": "Parámetros estadísticos"
        },
        "item": {
            "cursor": "hand",
            "font-color": "#fff",
            "margin": "5 17 2 0",
            "padding": "3 3 3 3"
        },
        "margin-top": "50",
        "marker": {
            "visible": false
        },
        "vertical-align": "top"
    }
    config['graphset'][0]['preview'] = {
        "adjust-layout": true,
        "live": true
    }
    config['graphset'][0]['scale-x'] = {
        "transform": {
            "all": "%d/%m/%Y<br>%H:%i:%s",
            "type": "date"
        },
        "zoom-to-values": zoomToValues[id],
        "zooming": true
    }
    config['graphset'][0]['scale-y'] = {
        "label": {
            "text": units
        },
        "markers": [{
            "label-placement": "normal",
            "label-alignment": "normal",
            "line-color": "green",
            "line-width": 1,
            "placement": "bottom",
            "range": [average(values)],
            "text": "Media",
            "type": "line"
        }]
    }
    config['graphset'][0]['series'] = [{
        "legend-item": {
            "background-color": "#7CA82B",
            "border-radius": 2
        },
        "legend-text": `Media: ${average(values).toFixed(2)}<br>Mediana: ${median(values).toFixed(2)}<br>` + 
                        `Moda: ${mode(values).join(', ')}<br>Varianza: ${variance(values).toFixed(2)}`,
        "text": "",
        "values": plot
    }]
    config['graphset'][0]['timezone'] = new Date().getTimezoneOffset() / (-60)

    return config
}

const getPieConfig = function(id, config, values, min, max) {
    let localValues = values.slice()
    localValues.reverse()
    localValues.push({ "timestamp": new Date() })

    max = Math.min(max || new Date().getTime(), new Date().getTime())
    min = Math.max(min || new Date(localValues[0].timestamp).getTime(), new Date(localValues[0].timestamp).getTime())

    let series = {
        "PAUSED": 0,
        "RUNNING": 0,
        "STOPPED": 0
    }, nSeries = 0

    localValues.reduce(function(prev, curr) {
        let dateCurr = new Date(curr.timestamp).getTime()
        let datePrev = new Date(prev.timestamp).getTime()

        if ((datePrev < min) && (dateCurr < min)) {  // Both under
            return curr
        } else if ((datePrev < min) && (dateCurr > min) && (dateCurr < max)) {  // prev under and curr inside
            datePrev = min
        } else if ((datePrev > min) && (datePrev < max) && (dateCurr > max)) {  // prev inside and curr over
            dateCurr = max
        } else if ((datePrev < min) && (dateCurr > max)) {  // prev under and curr over
            datePrev = min
            dateCurr = max
        } else if ((datePrev > max) && (dateCurr > max)) {  // Both over
            return curr
        }

        if (prev.value === 'START' || prev.value === 'RESUME')
            series['RUNNING'] += dateCurr - datePrev
        else if (prev.value === 'PAUSE')
            series['PAUSED'] += dateCurr - datePrev
        else if (prev.value === 'STOP')
            series['STOPPED'] += dateCurr - datePrev

        return curr
    })

    config['graphset'][0]['legend'] = {
        "adjust-layout": true,
        "align": "center",
        "background-color": "#FBFCFE",
        "border-width": 0,
        "item": {
            "cursor": "pointer",
            "font-color": "#777",
            "font-size": 12,
            "offsetX": -6
        },
        "marker": {
            "border-width": 0,
            "cursor": "pointer",
            "size": 5,
            "type": "circle"
        },
        "media-rules": [{
            "max-width": 500,
            "visible": false
        }],
        "toggle-action": "remove",
        "vertical-align": "bottom"
    }
    config['graphset'][0]['plot'] = {
        "background-color": "#FBFCFE",
        "border-width": 0,
        "slice": "50%",
        "value-box": [{
            "placement": "out",
            "text": "%t",
            "type": "all"
        },
        {
            "placement": "in",
            "text": "%npv%",
            "type": "all"
        }]
    }
    config['graphset'][0]['series'] = []
    config['graphset'][0]['tooltip'] = {
        "anchor": "c",
        "background-color": "none",
        "border-width": 0,
        "fontSize": 12,
        "media-rules": [{
            "max-width": 500,
            "y": "54%"
        }],
        "rules": [],
        "sticky": true,
        "text": `<span style="color:%color">%p</span><br><span style="color:%color">%v</span>`,
        "thousands-separator": ",",
        "x": "50%",
        "y": "50%"
    }
    if (series['RUNNING'] > 0) {
        config['graphset'][0]['series'].push({
            "background-color": "green",
            "line-color": "green",
            "line-width": 1,
            "marker": {
                "background-color": "green"
            },
            "text": "RUNNING",
            "values": [series['RUNNING']]
        })
        config['graphset'][0]['tooltip']['rules'].push({
            "rule": `%p == ${nSeries}`,
            "text": `<span style="color:%color">%t</span><br><span style="color:blue">${getFormatTime(series['RUNNING'])}</span>`
        })
        nSeries++
    }
    if (series['PAUSED'] > 0) {
        config['graphset'][0]['series'].push({
            "background-color": "orange",
            "line-color": "orange",
            "line-width": 1,
            "marker": {
                "background-color": "orange"
            },
            "text": "PAUSED",
            "values": [series['PAUSED']]
        })
        config['graphset'][0]['tooltip']['rules'].push({
            "rule": `%p == ${nSeries}`,
            "text": `<span style="color:%color">%t</span><br><span style="color:blue">${getFormatTime(series['PAUSED'])}</span>`
        })
        nSeries++
    }
    if (series['STOPPED'] > 0) {
        config['graphset'][0]['series'].push({
            "background-color": "red",
            "line-color": "red",
            "line-width": 1,
            "marker": {
                "background-color": "red"
            },
            "text": "STOPPED",
            "values": [series['STOPPED']]
        })
        config['graphset'][0]['tooltip']['rules'].push({
            "rule": `%p == ${nSeries}`,
            "text": `<span style="color:%color">%t</span><br><span style="color:blue">${getFormatTime(series['STOPPED'])}</span>`
        })
        nSeries++
    }

    return config
}

const getFormatTime = function(time) {
    let ms = time % 1000
    let sec = Math.floor(time / 1000)
    let min = Math.floor(sec / 60)
    sec = sec % 60
    let hour = Math.floor(min / 60)
    min = min % 60
    let day = Math.floor(hour / 24)
    hour = hour % 24
    let week = Math.floor(day / 7)
    day = day % 7

    let orderArray = [{
        "text": "semana",
        "value": week
    },
    {
        "text": "día",
        "value": day
    },
    {
        "text": "hora",
        "value": hour
    },
    {
        "text": "minuto",
        "value": min
    },
    {
        "text": "segundo",
        "value": sec
    },
    {
        "text": "milisegundo",
        "value": ms
    }]

    let text = ''

    for (let i in orderArray) {
        let element = orderArray[i]
        let nextElement = orderArray[+i + 1]
        if (element.value !== 0) {
            text = `${element.value} ${element.value > 1 ? element.text + 's' : element.text}`
            if (nextElement && nextElement.value > 0)
                text += ` y ${orderArray[+i + 1].value} ${nextElement.value > 1 ? nextElement.text + 's' : nextElement.text}`
            break
        }
    }

    return text
}

const modifyActions = function(p) {
    let actionName = p.id.replace(/data-(.*)-action-time$/, '$1')
    let idSum = p.id.replace(/-action-time$/, '-sum')
    let markers = zingchart.exec(p.id, 'getdata')['graphset'][0]['scale-x'].markers
    let localValues = []
    markers.forEach(function(element) {
        let value
        if (element['background-color'] === 'green')
            value = 'START'
        else if (element['background-color'] === 'orange')
            value = 'PAUSE'
        else if (element['background-color'] === 'red')
            value = 'STOP'
        localValues.push({
            "timestamp": new Date(element.range[0]),
            value
        })
    })
    localValues.reverse()
    zingchart.exec(idSum, 'destroy')
    zingchart.render({
        "id": idSum,
        "data": getConfig(idSum, 'pie', actionName, 'Datos totales', localValues, { "min": p.kmin, "max": p.kmax }),
        "height": "100%",
        "width": "97%"
    })
}

const modifyCon = function(p) {
    clearTimeout(modifyTimeout)
    zingchart.zoom = function(p) {}  // Void infinity loops
    let values = zingchart.exec(p.id, 'getseriesvalues', {
        "plotindex": 0
    })
    let x = values.map((value) => value[0])
    let y = values.map((value) => value[1])

    let maxIndex, minIndex

    if (p.action === 'viewall') {
        minIndex = 0
        maxIndex = x.length - 1
    } else if (p.kmin) {  // When zoom
        minIndex = x.findIndex((value) => value >= p.kmin)
        maxIndex = p.kmax ? x.length - x.reverse().findIndex((value) => value <= p.kmax) - 1 : x.length - 1
        x.reverse()
    } else if (p.nodeindex) {  // When a new message
        minIndex = x.indexOf(zoomToValues[p.id][0])
        maxIndex = x.indexOf(zoomToValues[p.id][1])
        maxIndex = p.nodeindex && p.nodeindex - 1 === maxIndex ? p.nodeindex : maxIndex
    }
    zoomToValues[p.id] = [x[minIndex], x[maxIndex]]

    values = y.slice(minIndex, maxIndex + 1)

    if (p.async !== false) {
        zingchart.exec(p.id, 'appendseriesdata', {
            "data": {
                "legend-text": `Media: ${average(values).toFixed(2)}<br>Mediana: ${median(values).toFixed(2)}<br>` +
                               `Moda: ${mode(values).join(', ')}<br>Varianza: ${variance(values).toFixed(2)}`
            },
            "graphid": p.graphid,
            "plotindex": 0
        })
        zingchart.exec(p.id, 'modify', {
            "data": {
                "scale-x": {
                    "zoom-to-values": zoomToValues[p.id]
                },
                "scale-y": {
                    "markers": [{
                        "label-alignment": "normal",
                        "label-placement": "normal",
                        "line-color": "green",
                        "line-width": 1,
                        "placement": "bottom",
                        "range": [average(values)],
                        "text": "Media",
                        "type": "line"
                    }],
                    "max-value": Math.max(...values),
                    "min-value": Math.min(...values)
                }
            },
            "graphid": 0
        })
    } else {
        delete(p.async)
        modifyTimeout = setTimeout(() => modify(p), 1000)
    }

    // Change bar chart

    let barId = p.id.replace(/-cont$/, '-sum')
    let order = getDataOrder(values)
    if (order >= 0) {
        values = values.map((value) => +Math.round(value))
    } else {
        values = values.map((value) => +Math.round(value * Math.pow(10, -order)) / Math.pow(10, -order))
    }
    let plot = group(values)
    zingchart.exec(barId, 'setseriesvalues', {
        plotindex : 0,
        values : plot
    })
    zingchart.zoom = modify
}

zingchart.load = function(p) {
    zingchart.zoom = modify
}

zingchart.node_add = function(p) {
    if (p.id.match(/.*-cont$/))
        modifyCon(p)
}

// Array functions

const average = function(arr) {
    let sum = arr.reduce((prev, curr) => prev += curr, 0)
    return +sum / arr.length
}

const getDataOrder = function(arr) {
    let avg = Math.abs(average(arr))
    if (avg === 0)
        return 1
    let order = Math.log10(avg)
    order = order >= 0 ? Math.ceil(order) : Math.floor(order)
    return order
}

const group = function(arr) {
    let group = [], n = 1
    arr = arr.sort((a, b) => a - b)

    if (arr[0] === arr[arr.length - 1]) {
        group = [[arr[0], arr.length]]
    } else {
        arr.reduce(function(prev, curr, index) {
            if (prev === curr) {
                n++
                if (index === arr.length - 1) {
                    group.push([prev, n])
                }
            } else {
                group.push([prev, n])
                n = 1
                if (index === arr.length - 1) {
                    group.push([curr, 1])
                }
            }
            return curr
        })
    }

    return group
}

const median = function(arr) {
    let n = arr.length
    let orderArray = arr.sort()

    if (n % 2 !== 0) {
        return +orderArray[Math.floor((n - 1) / 2)]
    } else {
        return +(orderArray[Math.floor((n - 1) / 2)] + orderArray[Math.ceil((n - 1) / 2)]) / 2
    }
}

const mode = function(arr) {
    let mode
    let values = group(arr)
    let max = Math.max(...values.map((value) => value[1]))
    mode = values.filter((value) => value[1] >= max).map((value) => value[0])
    return mode
}

const variance = function(arr) {
    let avg = average(arr)
    let n = arr.length
    return arr.reduce((prev, curr) => prev += Math.pow(+curr - avg, 2), 0) / n
}
