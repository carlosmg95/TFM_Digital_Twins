// ====================================================================================================================
// Public Functions
// ====================================================================================================================

const getConfig = function(type, title, subtitle, modelData, units) {
    let plot, values

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
                "legend": {
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
                    "marker": {
                        "visible": false
                    },
                    "vertical-align": "middle"
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
                    "adjustLayout": true,
                    "align": "left",
                    "text": subtitle
                },
                "title": {
                    "adjustLayout": true,
                    "align": "left",
                    "marginLeft": "15%",
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
            "contextMenu": {
                "alpha": 0.9,
                "button": {
                    "visible": true
                },
                "docked": true,
                "item": {
                    "textAlpha": 1
                },
                "position": "right"
            }
        }
    }

    if (type === 'line') {
        config = getLineConfig(config, modelData, units)
    } else if (type === 'bar') {
        config = getBarConfig(config, modelData, units)
    }

    return config
}


const modify = function(p) {
    zingchart.zoom = function(p) {}
    let values = zingchart.exec(p.id, 'getseriesvalues', {
        "plotindex": 0
    })
    let x = values.map((value) => value[0])
    let y = values.map((value) => value[1])

    let maxIndex, minIndex

    if (!p.kmin || !p.kmax || p.action === 'viewall') {
        minIndex = 0
        maxIndex = x.length - 1
    } else if (p.kmin) {
        minIndex = x.findIndex((value) => value >= p.kmin)
        maxIndex = p.kmax ? x.length - x.reverse().findIndex((value) => value <= p.kmax) - 1 : x.length - 1
    }

    values = y.slice(minIndex, maxIndex + 1)

    zingchart.exec(p.id, 'appendseriesdata', {
        "data": {
            "legend-text": `Media: ${average(values).toFixed(2)}<br>Mediana: ${median(values).toFixed(2)}<br>` + 
                           `Moda: ${mode(values).join(', ')}<br>Varianza: ${variance(values).toFixed(2)}`
        },
        "graphid": p.graphid,
        "plotindex": 0
    })
    zingchart.exec(p.id, 'modify', {
        "data" : {
            "scale-y" : {
                "markers": [
                    {
                        "label-alignment": "normal",
                        "label-placement": "normal",
                        "line-color": "green",
                        "line-width": 1,
                        "placement": "bottom",
                        "range": [average(values)],
                        "text": "Media",
                        "type": "line"
                    }
                ],
                "max-value": Math.max(...values),
                "min-value": Math.min(...values)
            }
        },
        "graphid": 0
    })

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

// ====================================================================================================================
// Private functions
// ====================================================================================================================

const getBarConfig = function(config, values, units) {
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
    config['graphset'][0]['series'] = [
        {
            "text": "",
            "values": plot
        }
    ]
    delete(config['graphset'][0]['utc'])
    delete(config['graphset'][0]['legend'])

    return config
}

const getLineConfig = function(config, values, units) {
    plot = values.map(function(value) {
        return [new Date(value.timestamp).getTime(), +value.value]
    }).reverse()
    values = plot.map((value) => value[1])

    config['graphset'][0]['scale-x'] = {
        "transform": {
            "all": "%d/%m/%Y<br>%H:%i:%s",
            "type": "date"
        },
        "zooming": true
    }
    config['graphset'][0]['scale-y'] = {
        "label": {
            "text": units
        },
        "markers": [
            {
                "label-placement": "normal",
                "label-alignment": "normal",
                "line-color": "green",
                "line-width": 1,
                "placement": "bottom",
                "text": "Media",
                "type": "line",
                "range": [average(values)]
            }
        ]
    }
    config['graphset'][0]['series'] = [
        {
            "legend-item": {
                "background-color": "#7CA82B",
                "border-radius": 2
            },
            "legend-text": `Media: ${average(values).toFixed(2)}<br>Mediana: ${median(values).toFixed(2)}<br>` + 
                            `Moda: ${mode(values).join(', ')}<br>Varianza: ${variance(values).toFixed(2)}`,
            "text": "",
            "values": plot
        }
    ]

    return config
}

zingchart.load = function(p){
    zingchart.zoom = modify
}

zingchart.node_add = function(p) {
    if (p.id.match(/.*-cont/)) {
        modify(p)
    }
}

// Array functions

const average = function(arr) {
    let sum = arr.reduce((prev, curr) => prev += curr)
    return +sum / arr.length
}

const getDataOrder = function(arr) {
    let avg = Math.abs(average(arr))
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
