/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 *
 * MX Visualisation Page
 */

var mxRenderer = new mxRenderer();
var VROUTER = 'virtual-router';
var ZOOMED_OUT = 0;
var timeout;
var expanded = true;
var statsResponseBytesKey = 'SUM(enterprise.juniperNetworks.fabricMessageExt.edges.class_stats.transmit_counts.bytes)';
var statsResponsePktsKey = 'SUM(enterprise.juniperNetworks.fabricMessageExt.edges.class_stats.transmit_counts.packets)';
var PRouterFieldPrefix = "enterprise.juniperNetworks.fabricMessageExt.edges.";
function mxRenderer() {
    this.load = function(obj) {
        this.configTemplate = Handlebars.compile($("#visualization-template").html());
        Handlebars.registerPartial("deviceSummary", $("#device-summary-template").html());
        Handlebars.registerPartial('underlayTabsHtml',$('#underlay-tabs').html());
        $("#content-container").html('');
        $("#content-container").html(this.configTemplate);
        currTab = 'mon_infra_mx';
        this.model = new mxModel();
        this.view  = new mxView(this.model);
        this.controller = new mxController(this.model, this.view);
        this.controller.getModelData();
    }

    this.getModel = function() {
        return this.model;
    }

    this.getView = function() {
        return this.view;
    }

    this.getController = function() {
        return this.controller;
    }

    this.destroy = function() {
        this.getModel().destroy();
        this.getView().destroy();
        this.getController().destroy();
    }
}

var LineCard = function(parent) {
    this.parent = parent;
    this.slot_identifier = 0;
    this.model_type = "";
    this.pfe_count = 0;
    this.cpu_count = 0;
    this.pfes = [];
    this.stats = [];
}

LineCard.prototype.getParentObject = function() {
    return this.parent;
}

LineCard.prototype.getSlotIdentifier = function() {
    return this.slot_identifier;
}

LineCard.prototype.setSlotIdentifier = function(slotId) {
    if(null !== slotId && typeof slotId !== "undefined") {
        if(typeof slotId === "number") {
            this.slot_identifier = slotId;
        } else {
            try {
                this.slot_identifier = parseInt(slotId);
            } catch(e) {
                this.slot_identifier = 0;
            }
        }
    } else {
        this.slot_identifier = 0;
    }
}
LineCard.prototype.setStats = function (stats) {
    if(stats != null) {
        this.stats =  stats;
    }
}
LineCard.prototype.getStats = function () {
    return this.stats;
}
LineCard.prototype.getModelType = function() {
    return this.model_type;
}

LineCard.prototype.setModelType = function(model_type) {
    if(null !== model_type && typeof model_type !== "undefined") {
        this.model_type = model_type;
    } else {
        this.model_type = "";
    }
}

LineCard.prototype.getPFECount = function() {
    return this.pfe_count;
}

LineCard.prototype.setPFECount = function(pfe_count) {
    if(null !== pfe_count && typeof pfe_count !== "undefined") {
        if(typeof pfe_count === "number") {
            this.pfe_count = pfe_count;
        } else {
            try {
                this.pfe_count = parseInt(pfe_count);
            } catch(e) {
                this.pfe_count = 0;
            }
        }
    } else {
        this.pfe_count = 0;
    }
    if(this.pfe_count > 0) {
        var pfeObjects = [];
        for(var i=0; i<this.pfe_count; i++) {
            var pfeObject = new PacketForwardingEngine();
            pfeObject.setSlotIdentifier(i);
            pfeObject.setParentObject(this);
            pfeObjects.push(pfeObject);
        }
        if(pfeObjects.length > 0) {
            this.setPFEObjects(pfeObjects);
        }
    }
}

LineCard.prototype.getCPUCount = function() {
    return this.cpu_count;
}

LineCard.prototype.setCPUCount = function(cpu_count) {
    if(null !== cpu_count && typeof cpu_count !== "undefined") {
        if(typeof cpu_count === "number") {
            this.cpu_count = cpu_count;
        } else {
            try {
                this.cpu_count = parseInt(cpu_count);
            } catch(e) {
                this.cpu_count = 0;
            }
        }
    } else {
        this.cpu_count = 0;
    }
}

LineCard.prototype.setPFEObjects = function(pfeObjects) {
    if(null !== pfeObjects && typeof pfeObjects !== "undefined" &&
        pfeObjects.length >0) {
        this.pfes = pfeObjects;
    } else {
        this.pfes = [];
    }
}

LineCard.prototype.getPFEObjects = function() {
    return this.pfes;
}

var SwitchCard = function() {
    this.slot_identifier = 0;
    this.model_type = "";
}

SwitchCard.prototype.getSlotIdentifier = function() {
    return this.slot_identifier;
}

SwitchCard.prototype.setSlotIdentifier = function(slotId) {
    if(null !== slotId && typeof slotId !== "undefined") {
        if(typeof slotId === "number") {
            this.slot_identifier = slotId;
        } else {
            try {
                this.slot_identifier = parseInt(slotId);
            } catch(e) {
                this.slot_identifier = 0;
            }
        }
    } else {
        this.slot_identifier = 0;
    }
}

SwitchCard.prototype.getModelType = function() {
    return this.model_type;
}

SwitchCard.prototype.setModelType = function(model_type) {
    if(null !== model_type && typeof model_type !== "undefined") {
        this.model_type = model_type;
    } else {
        this.model_type = "";
    }
}

var RoutingEngine = function() {
    this.slot_identifier = 0;
    this.model_type = "";
}

RoutingEngine.prototype.getSlotIdentifier = function() {
    return this.slot_identifier;
}

RoutingEngine.prototype.setSlotIdentifier = function(slotId) {
    if(null !== slotId && typeof slotId !== "undefined") {
        if(typeof slotId === "number") {
            this.slot_identifier = slotId;
        } else {
            try {
                this.slot_identifier = parseInt(slotId);
            } catch(e) {
                this.slot_identifier = 0;
            }
        }
    } else {
        this.slot_identifier = 0;
    }
}

RoutingEngine.prototype.getModelType = function() {
    return this.model_type;
}

RoutingEngine.prototype.setModelType = function(model_type) {
    if(null !== model_type && typeof model_type !== "undefined") {
        this.model_type = model_type;
    } else {
        this.model_type = "";
    }
}

var FanModule = function() {
    this.description = "";
}

FanModule.prototype.getDescription = function() {
    return this.description;
}

FanModule.prototype.setDescription = function(description) {
    if(null !== description && typeof description !== "undefined") {
        this.description = description;
    } else {
        this.description = "";
    }
}

var PowerModule = function () {
    this.model_type = "";
    this.serial_number = "";
}

PowerModule.prototype.getModelType = function() {
    return this.model_type;
}

PowerModule.prototype.setModelType = function(model_type) {
    if(null !== model_type && typeof model_type !== "undefined") {
        this.model_type = model_type;
    } else {
        this.model_type = "";
    }
}

PowerModule.prototype.getSerialNumber = function() {
    return this.serial_number;
}

PowerModule.prototype.setSerialNumber = function(serial_number) {
    if(null !== serial_number && typeof serial_number !== "undefined") {
        this.serial_number = serial_number;
    } else {
        this.serial_number = "";
    }
}

var PacketForwardingEngine = function() {
    this.slot_identifier = "";
    this.linecard = {};
    this.stats = [];
}

PacketForwardingEngine.prototype.setStats = function(stats) {
    if(stats != null){
        this.stats = stats;
    }
}
PacketForwardingEngine.prototype.getStats = function() {
    return this.stats;
}
PacketForwardingEngine.prototype.getSlotIdentifier = function() {
    return this.slot_identifier;
}

PacketForwardingEngine.prototype.setSlotIdentifier = function(slot_identifier) {
    if(null !== slot_identifier && typeof slot_identifier !== "undefined") {
        this.slot_identifier = slot_identifier;
    } else {
        this.slot_identifier = "";
    }
}

PacketForwardingEngine.prototype.getParentObject = function() {
    return this.linecard;
}

PacketForwardingEngine.prototype.setParentObject = function(linecard) {
    if(null !== linecard && typeof linecard !== "undefined") {
        this.linecard = linecard;
    } else {
        this.linecard = {};
    }
}
var PRouterChassisData = function() {
    this.name = "";
    this.identifier = "";
    this.model_type = "";
    this.telemetry_resources = "";
    this.max_routing_engines = 0;
    this.max_line_cards = 0;
    this.max_switch_cards = 0;
    this.max_fan_modules = 0;
    this.max_power_modules = 0;
    this.stats = [];
    this.routing_engines = [];
    this.line_cards      = [];
    this.switch_cards    = [];
    this.protocols       = [];
    this.power_modules   = [];
    this.fan_modules     = [];
}

PRouterChassisData.prototype.getName = function() {
    return this.name;
}

PRouterChassisData.prototype.setName = function(name) {
    if(null !== name && typeof name == "string") {
        this.name = name;
    } else {
        this.name = "";
    }
}

PRouterChassisData.prototype.getIdentifier = function() {
    return this.identifier;
}

PRouterChassisData.prototype.setIdentifier = function(id) {
    if(null !== id && typeof id == "string") {
        this.identifier = id;
    } else {
        this.identifier = "";
    }
}

PRouterChassisData.prototype.getModelType = function() {
    return this.model_type;
}

PRouterChassisData.prototype.setModelType = function(model_type) {
    if(null !== model_type && typeof model_type !== "undefined") {
        this.model_type = model_type;
    } else {
        this.model_type = "";
    }
}

PRouterChassisData.prototype.getLineCards = function() {
    return this.line_cards;
}

PRouterChassisData.prototype.getSwitchCards = function() {
    return this.switch_cards;
}

PRouterChassisData.prototype.getRoutingEngines = function() {
    return this.routing_engines;
}

PRouterChassisData.prototype.getFanModules = function() {
    return this.fan_modules;
}

PRouterChassisData.prototype.getPowerModules = function() {
    return this.power_modules;
}

PRouterChassisData.prototype.setData = function(data) {
    if(null !== data && typeof data !== "undefined") {
        if(data.identifier) {
            this.setIdentifier(data.identifier);
        }
        if(data.name) {
            this.setName(data.name);
        }
        if(data.model_type) {
            this.setModelType(data.model_type);
        }
        if(data.telemetry_resources) {
            this.setTelemetryResources(data.telemetry_resources);
        }
        if(data.max_routing_engines) {
            this.setMaxRoutingEngines(data.max_routing_engines);
        }
        if(data.max_line_cards) {
            this.setMaxLineCards(data.max_line_cards);
        }
        if(data.max_switch_cards) {
            this.setMaxSwitchCards(data.max_switch_cards);
        }
        if(data.max_fan_modules) {
            this.setMaxFanModules(data.max_fan_modules);
        }
        if(data.max_power_modules) {
            this.setMaxPowerModules(data.max_power_modules);
        }
        if(data.line_cards && typeof data.line_cards === "object" &&
            data.line_cards.length > 0) {
            var lcs = data.line_cards;
            for(var i=0; i<lcs.length; i++) {
                var tmpLC = new LineCard(this);
                tmpLC.setModelType(lcs[i].model_type);
                tmpLC.setSlotIdentifier(lcs[i].slot_identifier);
                tmpLC.setPFECount(lcs[i].pfe_count);
                tmpLC.setCPUCount(lcs[i].cpu_count);
                this.line_cards.push(tmpLC);
            }
        }
        if(data.stats) {
            this.setStats(data.stats);
        }
        /*if(data.switch_cards && typeof data.switch_cards === "object" &&
            data.switch_cards.length > 0) {
            var scs = data.switch_cards;
            for(var i=0; i<scs.length; i++) {
                var tmpSC = new SwitchCard();
                tmpSC.setModelType(scs[i].model_type);
                tmpSC.setSlotIdentifier(scs[i].slot_identifier);
                this.switch_cards.push(tmpSC);
            }
        }
        if(data.routing_engines && typeof data.routing_engines === "object" &&
            data.routing_engines.length > 0) {
            var res = data.routing_engines;
            for(var i=0; i<res.length; i++) {
                var tmpRE = new RoutingEngine();
                tmpRE.setModelType(res[i].model_type);
                tmpRE.setSlotIdentifier(res[i].slot_identifier);
                this.routing_engines.push(tmpRE);
            }
        }
        if(data.power_modules && typeof data.power_modules === "object" &&
            data.power_modules.length > 0) {
            var pms = data.power_modules;
            for(var i=0; i<pms.length; i++) {
                var tmpPM = new PowerModule();
                tmpPM.setSerialNumber(pms[i].serial_number);
                this.power_modules.push(tmpPM);
            }
        }
        if(data.fan_modules && typeof data.fan_modules === "object" &&
            data.fan_modules.length > 0) {
            var fms = data.fan_modules;
            for(var i=0; i<fms.length; i++) {
                var tmpFM = new FanModule();
                tmpFM.setDescription(fms[i].description);
                this.fan_modules.push(tmpFM);
            }
        }*/
        if(data.protocols && typeof data.protocols === "object" &&
            data.protocols.length > 0) {
            this.protocols = data.protocols;
        }
    }
}

PRouterChassisData.prototype.getMaxRoutingEngines = function() {
    return this.max_routing_engines;
}

PRouterChassisData.prototype.setMaxRoutingEngines = function(maxRE) {
    if(null !== maxRE && typeof maxRE !== "undefined") {
        if(typeof maxRE === "number") {
            this.max_routing_engines = maxRE;
        } else {
            try {
                this.max_routing_engines = parseInt(maxRE);
            } catch(e) {
                this.max_routing_engines = 0;
            }
        }
    } else {
        this.max_routing_engines = 0;
    }
}

PRouterChassisData.prototype.getMaxLineCards = function() {
    return this.max_line_cards;
}

PRouterChassisData.prototype.setMaxLineCards = function(maxLC) {
    if(null !== maxLC && typeof maxLC !== "undefined") {
        if(typeof maxLC === "number") {
            this.max_line_cards = maxLC;
        } else {
            try {
                this.max_line_cards = parseInt(maxLC);
            } catch(e) {
                this.max_line_cards = 0;
            }
        }
    } else {
        this.max_line_cards = 0;
    }
}

PRouterChassisData.prototype.getMaxSwitchCards = function() {
    return this.max_switch_cards;
}

PRouterChassisData.prototype.setMaxSwitchCards = function(maxSC) {
    if(null !== maxSC && typeof maxSC !== "undefined") {
        if(typeof maxSC === "number") {
            this.max_switch_cards = maxSC;
        } else {
            try {
                this.max_switch_cards = parseInt(maxSC);
            } catch(e) {
                this.max_switch_cards = 0;
            }
        }
    } else {
        this.max_switch_cards = 0;
    }
}

PRouterChassisData.prototype.getProtocols = function() {
    return this.protocols;
}

PRouterChassisData.prototype.setProtocols = function(protocols) {
    if(null !== protocols && typeof protocols !== "undefined" && 
        typeof protocols === "object" && protocols.length > 0) {
        this.protocols = protocols;
    } else {
        this.protocols = [];
    }
}

PRouterChassisData.prototype.getTelemetryResources = function() {
    return this.telemetry_resources;
}

PRouterChassisData.prototype.setTelemetryResources = function(telemetry_resources) {
    if(null !== telemetry_resources && typeof telemetry_resources !== "undefined") {
        this.telemetry_resources = telemetry_resources;
    } else {
        this.telemetry_resources = "";
    }
}

PRouterChassisData.prototype.getMaxFanModules = function() {
    return this.max_fan_modules;
}

PRouterChassisData.prototype.setMaxFanModules = function(maxFM) {
    if(null !== maxFM && typeof maxFM !== "undefined") {
        if(typeof maxFM === "number") {
            this.max_fan_modules = maxFM;
        } else {
            try {
                this.max_fan_modules = parseInt(maxFM);
            } catch(e) {
                this.max_fan_modules = 0;
            }
        }
    } else {
        this.max_fan_modules = 0;
    }
}

PRouterChassisData.prototype.getMaxPowerModules = function() {
    return this.max_power_modules;
}

PRouterChassisData.prototype.setMaxPowerModules = function(maxPM) {
    if(null !== maxPM && typeof maxPM !== "undefined") {
        if(typeof maxPM === "number") {
            this.max_power_modules = maxPM;
        } else {
            try {
                this.max_power_modules = parseInt(maxPM);
            } catch(e) {
                this.max_power_modules = 0;
            }
        }
    } else {
        this.max_power_modules = 0;
    }
}

PRouterChassisData.prototype.setStats = function (stats){
    if(stats != null) {
        this.stats = stats
    }
}

PRouterChassisData.prototype.getStats = function() {
    return this.stats;
}

var mxModel = function(data) {
    this.prouter_chassises = [];
    this.chasisStats = [];
    this.lineCardStats = [];
    this.pfeStats = [];
    if(data && data.hasOwnProperty('PRouterChassisUVEs') && data.PRouterChassisUVEs.length>0) {
        this.processData(data.PRouterChassisUVEs);
    } 
}

mxModel.prototype.setChasisStats = function(stats) {
    if(stats != null) {
        this.lineCardStats = stats;
    }
}
mxModel.prototype.setPfeStats = function(stats) {
    if(stats != null) {
        this.pfeStats = stats;
    }
}
mxModel.prototype.getChasisStats = function() {
    return this.chasisStats;
}

mxModel.prototype.getLineCardStats = function() {
    return this.lineCardStats;
}

mxModel.prototype.getPfeStats = function() {
    return this.pfeStats;
}

mxModel.prototype.setChasisStats = function(stats) {
    if(stats != null) {
        this.chasisStats = stats;
    }
}
mxModel.prototype.getProuterChassises = function() {
    return this.prouter_chassises;
}
mxModel.prototype.setProuterChassises = function(prouter_chassises) {
    if(null !== prouter_chassises && typeof prouter_chassises !== "undefined" && 
        typeof prouter_chassises === "object" && prouter_chassises.length > 0) {
        this.prouter_chassises = prouter_chassises;
    } else {
        this.prouter_chassises = [];
    }
}

mxModel.prototype.updateChassisType = function() {
    var nodes = this.getNodes();
    for(var i=0; i<nodes.length; i++) {
        if(nodes[i].chassis_type === "-") {
            nodes[i].chassis_type = nodes[i].node_type;
        }
    }
    this.setNodes(nodes);
}

mxModel.prototype.getData = function(cfg) {
    var url = cfg.url;
    var _this = this;
    if(null !== url && "" !== url.trim()) {
        $.ajax({
            dataType: "json",
            url: url,
            type: cfg.type,
            success: function (response) {
                cfg.callback(response);
            },
            failure: function (err) {
                if(cfg.failureCallback != null && typeof cfg.failureCallback == 'function')
                    cfg.failureCallback(err);
            }
        });
    }
}

mxModel.prototype.processData = function(data) {
    if(null !== data && data.hasOwnProperty('PRouterChassisUVEs') && 
        null === data.PRouterChassisUVEs || typeof data.PRouterChassisUVEs === "undefined" ||
        false === data.PRouterChassisUVEs || data.PRouterChassisUVEs.length <= 0) {
        return;
    }
    var nodes = [];
    var links = [];
    var prouterUves = [];
    for(var i=0; i<data.PRouterChassisUVEs.length; i++) {
        var tmpProuterData = data.PRouterChassisUVEs[i].PRouterChassisData;
        if(null === tmpProuterData || typeof tmpProuterData === "undefined")
            continue;
        var tmpProuter = new PRouterChassisData();
        tmpProuter.setData(tmpProuterData);
        prouterUves.push(tmpProuter);
    }
    if(prouterUves.length>0) {
        this.setProuterChassises(prouterUves);
    }

    var getAjaxs = [];
    for(var i=0; i<prouterUves.length; i++) {
        var lineCards = prouterUves[i].getLineCards();
        var lineCardsLen = ifNull(lineCards,[]).length;
        getAjaxs [getAjaxs.length] = $.ajax({
                                        url: '/api/tenant/networking/mx/fabric/stats',
                                        data: {
                                            'source': '50.1.0.254',
                                            'viewType': 'chasis'
                                        },context: {
                                            prouterUvesLen: prouterUves.length,
                                        }
                                     });
    }
    $.when.apply($,getAjaxs).then(
    	function () {
    		var results = arguments;
    		if(this.prouterUvesLen == 1) {
    		    results = [results];
    		}
    		var resultsLen = results.length;
    		for (var i = 0; i < resultsLen; i++){
    		    var resultObj = results[i];
    		    if(prouterUves[i] != null && resultObj[1] == 'success') {
    		        prouterUves[i].setStats(getValueByJsonPath(resultObj,'0;values',[]));
    		    }
    		}
    		
    	},
    	function (error) {
    	
    	}
    );
}

mxModel.prototype.reset = function() {
    this.prouter_chassises = [];
}

mxModel.prototype.destroy = function() {
    this.reset();
}

var mxView = function (model) {
    this.elementMap        = {
        nodes: {},
        links: {}
    };
    this.connectedElements = [];
    this.model = model || new mxModel();
    this.graph = new joint.dia.Graph;
    window.onresize = this.resizeTopology;
    var topologySize = this.calculateDimensions(false);
    this.setDimensions(topologySize);
    this.paper  = new joint.dia.Paper({
        el: $("#topology-connected-elements"),
        model: this.graph,
        width: $("#topology-connected-elements").innerWidth(),
        height: $("#topology-connected-elements").innerHeight()//,
        //linkView: joint.shapes.contrail.LinkView
    });
    this.chassisElId = "";

    this.initZoomControls();
    this.tooltipConfig = {};
    this.renderUnderlayTabs();
    this.chassis_selector_element = this.constructBreadcrumbDropdown("prouter_chassises");
}

mxView.prototype.getChassisSelectorElement = function() {
    return this.chassis_selector_element;
}

mxView.prototype.getConnectedElements = function() {
    return this.connectedElements;
}

mxView.prototype.getElementMap = function() {
    return this.elementMap;
}

mxView.prototype.calculateDimensions = function(expand) {
    var viewArea = this.getViewArea();
    var viewAreaHeight = viewArea.height;
    var viewAreaWidth = viewArea.width;

    var topologyHeight = (expand === true) ? viewAreaHeight*90/100 : viewAreaHeight*60/100;
    var detailsTabHeight = (expand === true) ? viewAreaHeight*10/100 : viewAreaHeight*40/100;
    return {
        "underlay_topology": {
            width: viewAreaWidth,
            height: viewAreaHeight
        },
            "network_topology": {
                width: viewAreaWidth,
                height: topologyHeight
            },
                "topology": {
                    width: viewAreaWidth*90/100,
                    height: topologyHeight
                },
                    "topology-connected-elements": {
                        width: viewAreaWidth*90/100,
                        height: topologyHeight
                    },
                    "topology-controls": {
                        width: viewAreaWidth*10/100,
                        height: topologyHeight
                    },
            "details_tab": {
                width: viewAreaWidth,
                height: detailsTabHeight
            }
    };
}

mxView.prototype.getViewArea = function() {
    var viewAreaWidth = 980;
    var viewAreaHeight = 725;
    var windowHeight = $(window).height()-100; //less breadcrumb
    var windowWidth = $(window).width();
    if(windowHeight > viewAreaHeight )
        viewAreaHeight = windowHeight;
    if(windowWidth > viewAreaWidth)
        viewAreaWidth = windowWidth - 200; //less menu
    return {"width": viewAreaWidth, "height": viewAreaHeight};
}

mxView.prototype.setDimensions = function(dimObj) {
    var _this = this;
    for(var prop in dimObj) {
        if(dimObj.hasOwnProperty(prop)) {
            $("#" + prop).innerWidth(dimObj[prop].width);
            $("#" + prop).innerHeight(dimObj[prop].height);
        }
    }
}

mxView.prototype.setConnectedElements = function(cEls) {
    if(null !== cEls && typeof cEls !== "undefined" &&
        cEls.length > 0) {
        this.connectedElements = cEls;
    } else {
        this.connectedElements = [];
    }
}

mxView.prototype.setElementMap = function(elMap) {
    if(null !== elMap && typeof elMap !== "undefined") {
        this.elementMap = elMap;
    } else {
        this.elementMap = [];
    }
}

mxView.prototype.getModel = function() {
    return this.model;
}

mxView.prototype.getGraph = function() {
    return this.graph;
}

mxView.prototype.getPaper = function() {
    return this.paper;
}

mxView.prototype.constructBreadcrumbDropdown = function(breadcrumbDropdownId) {
    var _this = this;
    var breadcrumbElement = $('#breadcrumb'); //TODO - move to constants
    breadcrumbElement.children('li').removeClass('active');
    breadcrumbElement.children('li:last').append('<span class="divider"><i class="icon-angle-right"></i></span>');
    breadcrumbElement.append('<li class="active ' + breadcrumbDropdownId +'"><div id="' + breadcrumbDropdownId + '"></div></li>');

    var domainDropdownElement = $('#' + breadcrumbDropdownId);
    var domainDropdown = domainDropdownElement.contrailDropdown({
        dataTextField: "name",
        dataValueField: "value",
        change: function (e) {
            _this.createElements(e.target.value);
        }
    }).data('contrailDropdown');
    return domainDropdown;
}

mxView.prototype.populateDomainBreadcrumbDropdown = function() {
    var _this = this;
    var data = this.getModel().getProuterChassises();
    var domainDropdownElement = this.getChassisSelectorElement();
    var dropdownData = [];
    for (var i = 0; i < data.length ; i++){
         var jsonData = {};
         var chassisId = data[i].getIdentifier();
         jsonData['name'] = chassisId;
         jsonData['value'] = chassisId;
         dropdownData.push(jsonData);
    }
    if (dropdownData.length > 0) {
        domainDropdownElement.setData(dropdownData);
        //_this.getView().renderMxDetails();
        $("#prouter_chassises").trigger('change');
        $(_this.getGraph().getCell(_this.chassisElId)).trigger('click');
    } else {
        //TODO - Empty message - that.$el.html(ctwm.NO_PROJECT_FOUND);
    }
}

mxView.prototype.addElementsToGraph = function(selectedProuter) {
    var graph = this.getGraph();
    graph.clear();
    $("#topology-connected-elements").find("div").remove();
    var model = thie.getModel();
    var data = model.getProuterChassises();
    var tmpProuterData = "";
    for(var i=0; i<data.length; i++) {
        if(data[i].getIdentifier() === selectedProuter) {
            tmpProuterData = data[i];
            break;
        }
    }
    if(tmpProuterData === "") {
        //todo
        return;
    }

    var imageName = "vrouter",
        imageLink = '/img/icons/' + imageName,
        x_position = $("#topology-connected-elements").offset().top,
        y_position = $("#topology-connected-elements").offset().left;

    var lineCards = tmpProuterData.getLineCards();
    var no_of_line_cards = lineCards.length;
    if(no_of_line_cards <= 0) {
        //todo - show empty message "no line cards"
        return;
    }

    var options = {
        font: {
            iconClass: 'icon-contrail-coreswitch'
        },
        nodeDetails: {},
        position : {
            x : 0,
            y : 0
        },
        size : {
            width : 30,
            height : 30
        },
        attrs : {
            image : {
                "xlink:href" : imageLink,
                width : 30,
                height : 30
            },
            text: {
                text: ''
            }
        }
    }
    var image = new ContrailElement('virtual-router', options);
    
    this.getPaper().setDimensions($("#topology-connected-elements").width(), $("#topology-connected-elements").height());
    
    var objects = [];
    var links = []
    for (var j = 0; j < no_of_line_cards; j++){
        var obj = lineCards[ j ];
        x_position = x_position + 80;
        y_position = 0;
        var pfeCount = obj.getPFECount();
        for (var x= 0 ; x< pfeCount; x++) {
            var object = image.clone();
            object.prop( 'position' , {x : x_position,y : y_position});
            object.prop( 'attrs.text' , {text: 'bac'});
            y_position = y_position + 80;
            objects.push(object);
        }

    }
    for (i =0;i<objects.length;i++)
    {
        for (j =i+1;j<objects.length;j++){
            var link = new joint.dia.Link({
                source: { id: objects[i].id },
                target: { id: objects[j].id }
            });
            links.push(link);
        }
    }
    if(links.length > 0){
        mesh = objects.concat(links);
    }

    if(objects.length > 0){
        graph.addCells(mesh);
    }
}

mxView.prototype.createElements = function(selectedProuter) {
    var graph = this.getGraph();
    graph.clear();
    var paper = this.getPaper();
    this.renderMxDetails();
    $("#topology-connected-elements").find("div").remove();
    var model = this.getModel();
    var data = model.getProuterChassises();
    if(null === data || typeof data === "undefined") {
        return;
    }
    if(typeof data === "object" && data.length <= 0) {
        return;
    }

    var nodeEls = [];
    var linkEls = [];
    for(var chassisCount=0; chassisCount<data.length; chassisCount++) {
        var tmpProuterData = data[chassisCount];
        var chassisId = tmpProuterData.getIdentifier();

        var lineCards = tmpProuterData.getLineCards();
            /*switchCards = tmpProuterData.getSwitchCards(),
            routingEngines = tmpProuterData.getRoutingEngines(),
            powerModules = tmpProuterData.getPowerModules(),
            fanModules = tmpProuterData.getFanModules();*/

        var no_of_line_cards = 0;
            no_of_switch_cards = 0,
            no_of_routing_engines = 0,
            no_of_power_modules = 0,
            no_of_fan_modules = 0;

        if(null !== lineCards && typeof lineCards === "object" && lineCards.length>0)
            no_of_line_cards = lineCards.length;

        /*if(null !== switchCards && typeof switchCards === "object" && switchCards.length>0)
            no_of_switch_cards = switchCards.length;

        if(null !== routingEngines && typeof routingEngines === "object" && routingEngines.length>0)
            no_of_routing_engines = routingEngines.length;

        if(null !== powerModules && typeof powerModules === "object" && powerModules.length>0)
            no_of_power_modules = powerModules.length;

        if(null !== fanModules && typeof fanModules === "object" && fanModules.length>0)
            no_of_fan_modules = fanModules.length;*/

        var chassisEl = 
            this.createNode({name: "chassis_" + chassisId, modelData: tmpProuterData, parentData: {}}, 'chassis', no_of_line_cards, no_of_switch_cards, 
                no_of_routing_engines, no_of_power_modules, no_of_fan_modules, 0, 0, 'chassis');
        nodeEls.push(chassisEl);
        this.chassisElId = chassisEl.id;

        var lineCardEls = [];
        for (var i=0; i<no_of_line_cards; i++) {
            var lineCardEl = this.createNode({name: "chassis_" + chassisId + "_lc_" + lineCards[i].getSlotIdentifier(), modelData: lineCards[i], parentData: tmpProuterData}, 'line-card', no_of_line_cards, no_of_switch_cards, 
                no_of_routing_engines, no_of_power_modules, no_of_fan_modules, 0, i, 'chassis');
            lineCardEls.push(lineCardEl);
        }
        nodeEls = nodeEls.concat(lineCardEls);
        var lcToFabricLinkEls = [];
        for (var i=0; i<no_of_line_cards; i++) {
            for (var j=0; j<no_of_line_cards; j++) {
                var lcToFabricLinkEl = this.createLink({modelData: {source: lineCards[i], target: lineCards[j]}}, 'lc-lc', lineCardEls[i], chassisEl); 
                lcToFabricLinkEls.push(lcToFabricLinkEl);
                //lcToFabricLinkEls.push(lcToFabricLinkEl.clone());
            }
        }

        /*var switchCardEls = [];
        for (var i=0; i<no_of_switch_cards; i++) {
            var switchCardEl = this.createNode({name: "chassis_" + chassisId + "_sc_" + switchCards[i].getSlotIdentifier(), modelData: switchCards[i], parentData: tmpProuterData}, 'switch-card', no_of_line_cards, no_of_switch_cards, 
                no_of_routing_engines, no_of_power_modules, no_of_fan_modules, 0, i, 'chassis');
            switchCardEls.push(switchCardEl);
        }
        nodeEls.push(switchCardEls);
        var scToFabricLinkEls = [];
        for (var i=0; i<no_of_switch_cards; i++) {
            var scToFabricLinkEl = this.createLink({modelData: {source: switchCards[i], target: tmpProuterData}}, 'sc-fb', switchCardEls[i], chassisEl); 
            scToFabricLinkEls.push(scToFabricLinkEl);
        }

        var routingEngineEls = [];
        for (var i=0; i<no_of_routing_engines; i++) {
            var routingEngineEl = this.createNode({name: "chassis_" + chassisId + "_re_" + routingEngines[i].getSlotIdentifier(), modelData: routingEngines[i], parentData: tmpProuterData}, 'routing-engine', no_of_line_cards, no_of_switch_cards, 
                no_of_routing_engines, no_of_power_modules, no_of_fan_modules, 0, i, 'chassis');
            routingEngineEls.push(routingEngineEl);
        }
        nodeEls.push(routingEngineEls);
        var reToFabricLinkEls = [];
        for (var i=0; i<no_of_routing_engines; i++) {
            var reToFabricLinkEl = this.createLink({modelData: {source: routingEngines[i], target: tmpProuterData}}, 're-fb', routingEngineEls[i], chassisEl); 
            reToFabricLinkEls.push(reToFabricLinkEl);
        }

        var powerModuleEls = [];
        for (var i=0; i<no_of_power_modules; i++) {
            var powerModuleEl = this.createNode({name: "chassis_" + chassisId + "_pm_" + i, modelData: powerModules[i], parentData: tmpProuterData}, 'power-module', no_of_line_cards, no_of_switch_cards, 
                no_of_routing_engines, no_of_power_modules, no_of_fan_modules, 0, i, 'chassis');
            powerModuleEls.push(powerModuleEl);
        }
        nodeEls.push(powerModuleEls);
        var pmToFabricLinkEls = [];
        for (var i=0; i<no_of_power_modules; i++) {
            var pmToFabricLinkEl = this.createLink({modelData: {source: powerModules[i], target: tmpProuterData}}, 'pm-fb', powerModuleEls[i], chassisEl); 
            pmToFabricLinkEls.push(pmToFabricLinkEl);
        }

        var fanModuleEls = [];
        for (var i=0; i<no_of_fan_modules; i++) {
            var fanModuleEl = this.createNode({name: "chassis_" + chassisId + "_fm_" + i, modelData: fanModules[i], parentData: tmpProuterData}, 'fan-module', no_of_line_cards, no_of_switch_cards, 
                no_of_routing_engines, no_of_power_modules, no_of_fan_modules, 0, i, 'chassis');
            fanModuleEls.push(fanModuleEl);
        }
        nodeEls.push(fanModuleEls);
        var fmToFabricLinkEls = [];
        for (var i=0; i<no_of_fan_modules; i++) {
            var fmToFabricLinkEl = this.createLink({modelData: {source: fanModules[i], target: tmpProuterData}}, 'fm-fb', fanModuleEls[i], chassisEl); 
            fmToFabricLinkEls.push(fmToFabricLinkEl);
        }*/
    }
    linkEls = linkEls.concat(lcToFabricLinkEls);
    /*linkEls = linkEls.concat(lcToFabricLinkEls).
            concat(scToFabricLinkEls).
            concat(reToFabricLinkEls).
            concat(pmToFabricLinkEls).
            concat(fmToFabricLinkEls);*/

    this.setElementMap({nodes:nodeEls, links: linkEls});
    var allEls = nodeEls.concat(linkEls);
    graph.addCells(allEls);
    var newGraphSize = joint.layout.DirectedGraph.layout(graph, {"rankDir" : "BT", "nodeSep" : 60, "rankSep" : 100});
    var svgHeight = newGraphSize.height;
    var svgWidth = newGraphSize.width;
    var viewAreaHeight = $("#topology-connected-elements").height();
    var viewAreaWidth = $("#topology-connected-elements").width();
    var offsetY = (viewAreaHeight - svgHeight)/2;
    var offsetX = (viewAreaWidth - svgWidth)/2;
    var offset = {
        x: offsetX,
        y: offsetY
    };

    $.each(allEls, function (elementKey, elementValue) {
        elementValue.translate(offset.x, offset.y);
    });

    /*var constraint = g.ellipse(
        g.point(
            $("#topology-connected-elements").width()/2, 
            $("#topology-connected-elements").height()/2
        ), 
        $("#topology-connected-elements").height()/2, 
        $("#topology-connected-elements").height()/2-40
    );
    var orbit = V('<ellipse/>');
    orbit.attr({
        cx: constraint.x, cy: constraint.y, rx: constraint.a, ry: constraint.b,
        fill: '#ECF0F1', stroke: '#34495E', 'stroke-dasharray': [2,2]
    });
    V(paper.viewport).append(orbit);*/
    //var pms = tmpProuterData.getPowerModules();
    //var fms = tmpProuterData.getFanModules();

    /*for (var i=0; i<no_of_line_cards; i++) {
        var obj = lineCards[i];
        x_position = x_position + 80;
        y_position = 80;
        var pfeCount = obj.getPFECount();
        for (var j=0 ; j<pfeCount; j++) {
            var nodeEl = this.createNode("SLOT " + i + " : PFE " + j, 
                //constraint.intersectionWithLineFromCenterToPoint(g.point(x_position, y_position)).offset(-20, -20));
                {x:x_position, y:y_position},obj,i,j);
            y_position = y_position + 80;
            nodeEls.push(nodeEl);
        }
    }
    var linkEls = [];
    if(nodeEls.length > 0) {
        for(var i=0; i<nodeEls.length; i++) {
            for (j=i+1;j<nodeEls.length;j++) {
                var linkEl = this.createLink({}, "pr-pr", nodeEls[i].id, nodeEls[j].id,nodeEls[i],nodeEls[j]);
                linkEls.push(linkEl);
            }
        }
        if(linkEls.length > 0) {
            graph.addCells(nodeEls.concat(linkEls));
        }
    }*/
}

mxView.prototype.createLink = function(link, link_type, source, target) {
        var options;
        var linkElement;
        link.link_type = link_type;
        options = {
            direction   : "bi",
            linkType    : link.link_type,
            linkDetails : link
        };
        link['connectionStroke'] = '#637939';
        options['sourceId'] = source.id
        options['targetId'] = target.id;
        linkElement = new ContrailElement('link', options);
        /*linkElement = new joint.dia.Link({
            source: { id: source.id },
            target: { id: target.id },
            attrs: { '.connection': { 'stroke-width': 1.2, stroke: '#222' }, '.marker-vertices': { display: 'none' }},
            smooth: true, // We'are using a bezier curve
            z: -1 // The links are always lying under the elements.
        });*/
        return linkElement;
}

mxView.prototype.adjustVertices = function(graph, cell) {
    //http://jointjs.com/tutorial/multiple-links-between-elements
    // If the cell is a view, find its model.
    cell = cell.model || cell;

    if (cell instanceof joint.dia.Element) {

        _.chain(graph.getConnectedLinks(cell)).groupBy(function(link) {
            // the key of the group is the model id of the link's source or target, but not our cell id.
            return _.omit([link.get('source').id, link.get('target').id], cell.id)[0];
        }).each(function(group, key) {
            // If the member of the group has both source and target model adjust vertices.
            if (key !== 'undefined') mxRenderer.getView().adjustVertices(graph, _.first(group));
        });

        return;
    }

    // The cell is a link. Let's find its source and target models.
    var srcId = cell.get('source').id || cell.previous('source').id;
    var trgId = cell.get('target').id || cell.previous('target').id;

    // If one of the ends is not a model, the link has no siblings.
    if (!srcId || !trgId) return;

    var siblings = _.filter(graph.getLinks(), function(sibling) {

        var _srcId = sibling.get('source').id;
        var _trgId = sibling.get('target').id;

        return (_srcId === srcId && _trgId === trgId) || (_srcId === trgId && _trgId === srcId);
    });

    switch (siblings.length) {

    case 0:
        // The link was removed and had no siblings.
        break;

    case 1:
        // There is only one link between the source and target. No vertices needed.
        cell.unset('vertices');
        break;

    default:

        // There is more than one siblings. We need to create vertices.

        // First of all we'll find the middle point of the link.
        var srcCenter = graph.getCell(srcId).getBBox().center();
        var trgCenter = graph.getCell(trgId).getBBox().center();
        var midPoint = g.line(srcCenter, trgCenter).midpoint();

        // Then find the angle it forms.
        var theta = srcCenter.theta(trgCenter);

        // This is the maximum distance between links
        var gap = 10;

        _.each(siblings, function(sibling, index) {

            // We want the offset values to be calculated as follows 0, 20, 20, 40, 40, 60, 60 ..
            var offset = gap * Math.ceil(index / 2);

            // Now we need the vertices to be placed at points which are 'offset' pixels distant
            // from the first link and forms a perpendicular angle to it. And as index goes up
            // alternate left and right.
            //
            //  ^  odd indexes 
            //  |
            //  |---->  index 0 line (straight line between a source center and a target center.
            //  |
            //  v  even indexes
            var sign = index % 2 ? 1 : -1;
            var angle = g.toRad(theta + sign * 90);

            // We found the vertex.
            var vertex = g.point.fromPolar(offset, angle, midPoint);

            sibling.set('vertices', [{ x: vertex.x, y: vertex.y }]);
        });
    }
};


mxView.prototype.createNode = function(data, type, no_of_line_cards, no_of_switch_cards, no_of_routing_engines, no_of_power_modules, no_of_fan_modules, no_of_pfes, currentIndex, view) {
    var nodeType  = type,
        xPos      = 0,
        yPos      = 0,
        width     = 40,
        height    = 40,
        totalBlocks = 0,
        blocksPerColumn = 0,
        imageLink = "",
        iconClass = "",
        label     = "";
    if(view !== "pfe") {
        totalBlocks = no_of_line_cards + no_of_switch_cards + no_of_routing_engines + no_of_power_modules + no_of_fan_modules;
        blocksPerColumn = Math.ceil(totalBlocks / 2);
    }
    else {
        totalBlocks = no_of_pfes;
        blocksPerColumn = data.modelData.getParentObject().getPFECount();
    }
    
    var perBlockHeight = ($("#topology-connected-elements").height() - 5)/blocksPerColumn;
    height = (perBlockHeight < 40) ? perBlockHeight : 40;
    width = height;

    switch (type) {
        case 'chassis':
            label = "Fabric";
            iconClass = "mxicon-fabrics-horiz";
            width = 40;
            height = 40;
            xPos = ($("#topology-connected-elements").width() - 40)/2;
            yPos = ($("#topology-connected-elements").height() - 40)/2;
            break;
        case 'line-card':
            iconClass = "mxicon-line-card";
            label = "Slot " + data.modelData.getSlotIdentifier();
            yPos = (currentIndex%blocksPerColumn) * perBlockHeight;
            xPos = (currentIndex < blocksPerColumn) ? ((($("#topology-connected-elements").width() - 40)/2) - 100) : ((($("#topology-connected-elements").width() - 40)/2) + 100);
            break;
        case 'switch-card':
            iconClass = "mxicon-switch-card";
            label = "SC " + data.modelData.getSlotIdentifier();
            currentIndex = currentIndex + no_of_line_cards;
            yPos = (currentIndex%blocksPerColumn) * perBlockHeight;
            xPos = (currentIndex < blocksPerColumn) ? ((($("#topology-connected-elements").width() - 40)/2) - 100) : ((($("#topology-connected-elements").width() - 40)/2) + 100);
            break;
        case 'routing-engine':
            iconClass = "mxicon-routing-engine";
            label = "RE " + data.modelData.getSlotIdentifier();
            currentIndex = currentIndex + no_of_line_cards + no_of_switch_cards;
            yPos = (currentIndex%blocksPerColumn) * perBlockHeight;
            xPos = (currentIndex < blocksPerColumn) ? ((($("#topology-connected-elements").width() - 40)/2) - 100) : ((($("#topology-connected-elements").width() - 40)/2) + 100);
            break;
        case 'power-module':
            iconClass = "mxicon-power-supply";
            label = "PSU " + data.modelData.getSlotIdentifier();
            currentIndex = currentIndex + no_of_line_cards + no_of_switch_cards + no_of_routing_engines;
            yPos = (currentIndex%blocksPerColumn) * perBlockHeight;
            xPos = (currentIndex < blocksPerColumn) ? ((($("#topology-connected-elements").width() - 40)/2) - 100) : ((($("#topology-connected-elements").width() - 40)/2) + 100);
            break;
        case 'fan-module':
            iconClass = "mxicon-fan-tray";
            label = "Fan Tray " + data.modelData.getSlotIdentifier();
            currentIndex = currentIndex + no_of_line_cards + no_of_switch_cards + no_of_routing_engines + no_of_power_modules;
            yPos = (currentIndex%blocksPerColumn) * perBlockHeight;
            xPos = (currentIndex < blocksPerColumn) ? ((($("#topology-connected-elements").width() - 40)/2) - 100) : ((($("#topology-connected-elements").width() - 40)/2) + 100);
            break;
        case 'packet-forwarding-engine':
            iconClass = "mxicon-packet-forwarding";
            if(view !== "pfe") {
                label = "PFE " + currentIndex;
                yPos = (currentIndex%blocksPerColumn) * perBlockHeight;
                xPos = (currentIndex < blocksPerColumn) ? ((($("#topology-connected-elements").width() - 40)/2) - 100) : ((($("#topology-connected-elements").width() - 40)/2) + 100);
            } else {
                label = "Slot " + (data.name.split("_linecard_")[1]).split("_pfe_")[0] + " : PFE " + currentIndex;
                var availableWidth = ($("#topology-connected-elements").width() - 40);
                var columns = no_of_line_cards;
                var perColumnWidth = availableWidth/columns;
                xPos = (perColumnWidth - width) * (parseInt((data.name.split("_linecard_")[1]).split("_pfe_")[0]) + 1);
                yPos = (currentIndex%blocksPerColumn) * perBlockHeight;
                //xPos = (currentIndex < blocksPerColumn) ? ((($("#topology-connected-elements").width() - 40)/2) - 100) : ((($("#topology-connected-elements").width() - 40)/2) + 100);
            }
            break;
    }
    var options = {
        attrs: {
            text: {
                text: label
            }
        },
        size: {
            width: width,
            height: height
        },
        nodeDetails: data,
        //position: {x: xPos, y: yPos},
        font: {
            iconClass: iconClass
        }
    };
    return new ContrailElement(nodeType, options);
}

mxView.prototype.initZoomControls = function() {
    $("#topology-connected-elements").panzoom({
        transition: true,
        duration: 200,
        increment: 0.1,
        minScale: 0.5,
        maxScale: 20,
        contain: false,
        $zoomIn: $("#topology-controls").find(".zoom-in"),
        $zoomOut: $("#topology-controls").find(".zoom-out"),
        $reset: $("#topology-controls").find(".zoom-reset"),
        cursor: "default"
    });
    var _this = this;
    $('#topology-connected-elements').on('mousedown touchstart', function( e ) {
        if(e.target.nodeName == 'svg') {
            $('#topology-connected-elements').panzoom("enable");
        } else{
            $('#topology-connected-elements').panzoom("disable");
        }
    });
    $('#topology-connected-elements').on('mouseup touchend', function( e ) {
        $('#topology-connected-elements').panzoom("enable");
    });
}

mxView.prototype.initTooltipConfig = function() {
    var _this = this;
    this.tooltipConfig = {
        VirtualRouter: {
            title: function(element, graph) {
                return 'PFE';
            },
            content: function(element, graph) {
                var viewElement = graph.getCell(element.attr('model-id'));
                var tooltipContent = contrail.getTemplate4Id('tooltip-content-template');
                if(viewElement.attributes && viewElement.attributes.hasOwnProperty('nodeDetails'))
                return tooltipContent([
                    {
                        lbl:'Model Type',
                        value: viewElement.attributes.nodeDetails['model_type']
                    },
                    {
                        lbl: "CPU COUNT",
                        value: viewElement.attributes.nodeDetails['cpu_count']
                    }
                ]);
            }
        },
        link: {
            title: function(element, graph) {
                var viewElement = graph.getCell(element.attr('model-id'));
                var linkType = viewElement.attributes.linkDetails.link_type;
                switch (linkType) {
                    case 'lc-lc':
                        var endpoint1 = viewElement.attributes.linkDetails.modelData.source;
                        var endpoint2 = viewElement.attributes.linkDetails.modelData.target;
                        return "<div>Traffic between Slot " + endpoint1.getSlotIdentifier() + 
                            " and Slot " + endpoint2.getSlotIdentifier() + "</div>";
                    case 'pfe-lc':
                        var endpoint1 = viewElement.attributes.linkDetails.modelData.source;
                        var endpoint2 = viewElement.attributes.linkDetails.modelData.target;

                        return "<div>Traffic between PFE " + endpoint1.getSlotIdentifier() + 
                            " (Slot " + endpoint1.getParentObject().getSlotIdentifier() +
                            ") and Slot " + endpoint2.getSlotIdentifier() + "</div>";
                    case 'pfe-pfe':
                        var endpoint1 = viewElement.attributes.linkDetails.modelData.source;
                        var endpoint2 = viewElement.attributes.linkDetails.modelData.target;

                        return "<div>Traffic between PFE " + endpoint1.getSlotIdentifier() + 
                            " (Slot " + endpoint1.getParentObject().getSlotIdentifier() + ") and " + 
                            "PFE " + endpoint2.getSlotIdentifier() + " (Slot " + 
                            endpoint2.getParentObject().getSlotIdentifier() + ")</div>";
                }
            },
            content: function(element, graph) {
                var viewElement = graph.getCell(element.attr('model-id'));
                var linkType = viewElement.attributes.linkDetails.link_type;
                var endpoint1 = viewElement.attributes.linkDetails.modelData.source;
                var endpoint2 = viewElement.attributes.linkDetails.modelData.target;
                var srcSlot = endpoint1.getSlotIdentifier();
                var dstSlot = endpoint2.getSlotIdentifier();
                var tooltipContent = contrail.getTemplate4Id('two-column-content-template');
                var egressBytes = 0,
                    egressPkts = 0,
                    ingressBytes = 0,
                    ingressPkts = 0;
                switch (linkType) {
                    case 'lc-lc':
                        var stats = endpoint1.getParentObject().getStats();
                        egressBytes = getValueByJsonPath(stats,srcSlot+";"+dstSlot+";"+statsResponseBytesKey,0);
                        egressPkts = getValueByJsonPath(stats,srcSlot+";"+dstSlot+";"+statsResponsePktsKey,0);
                        ingressBytes = getValueByJsonPath(stats,dstSlot+";"+srcSlot+";"+statsResponseBytesKey,0);
                        ingressPkts = getValueByJsonPath(stats,dstSlot+";"+srcSlot+";"+statsResponsePktsKey,0);
                        break;
                    case 'pfe-lc':
                        var srclcSlot = endpoint1.getParentObject().getSlotIdentifier();
                        var stats = endpoint1.getParentObject().getStats();
                        var egressStatsLst = getValueByJsonPath(stats,srclcSlot+";"+srcSlot+";"+dstSlot,{});
                        $.each(egressStatsLst,function(idx,obj){
                            egressBytes += ifNull(obj[statsResponseBytesKey],0);
                            egressPkts += ifNull(obj[statsResponsePktsKey],0);
                        });
                        var ingressStatsLst = ifNull(stats[dstSlot],{});
                        $.each(ingressStatsLst,function(idx,obj){
                            ingressBytes += getValueByJsonPath(obj,srclcSlot+";"+srcSlot+";"+statsResponseBytesKey,0);
                            ingressPkts += getValueByJsonPath(obj,srclcSlot+";"+srcSlot+";"+statsResponsePktsKey,0);
                        });
                        break;
                    case 'pfe-pfe':
                        var stats = endpoint1.getParentObject().getStats();
                        var srclcSlot = endpoint1.getParentObject().getSlotIdentifier();
                        var dstlcSlot = endpoint2.getParentObject().getSlotIdentifier();
                        egressBytes = getValueByJsonPath(stats,srclcSlot+";"+srcSlot+";"+dstlcSlot+";"+dstSlot+";"+statsResponseBytesKey,0);
                        egressPkts = getValueByJsonPath(stats,srclcSlot+";"+srcSlot+";"+dstlcSlot+";"+dstSlot+";"+statsResponsePktsKey,0);
                        ingressBytes = getValueByJsonPath(stats,dstlcSlot+";"+dstSlot+";"+srclcSlot+";"+srcSlot+";"+statsResponseBytesKey,0);
                        ingressPkts = getValueByJsonPath(stats,dstlcSlot+";"+dstSlot+";"+srclcSlot+";"+srcSlot+";"+statsResponsePktsKey,0);
                        break;
                }
                return tooltipContent([
                    {
                        lbl: "Out",
                        value:  formatBytes(egressBytes)+" / "+egressPkts
                    },
                    {
                        lbl: "In",
                        value:  formatBytes(ingressBytes)+" / "+ingressPkts
                    }
                ]);
            }
        }
    };
    $.each(this.tooltipConfig, function(keyConfig, valueConfig){
        $('g.' + keyConfig).popover({
            trigger: 'hover',
            html: true,
            delay: { show: 200, hide: 10 },
            title: function(){
                return valueConfig.title($(this), _this.getGraph());
            },
            content: function(){
                return valueConfig.content($(this), _this.getGraph());
            },
            container: $('body')
        });
    });
}

mxView.prototype.initGraphEvents = function() {
    var paper = this.getPaper();
    var graph = this.getGraph();
    var selectorId = "#" + paper.el.id;
    var _this      = this;

    paper.on('blank:pointerdblclick', function (evt, x, y) {
        evt.stopImmediatePropagation();
        _this.resetTopology();
    });

    paper.on('cell:pointerdown', function (cellView, evt, x, y) {
        evt.stopImmediatePropagation();
        _this.adjustVertices(graph, cellView);
    });

    paper.on('cell:pointerdblclick', function (cellView, evt, x, y) {
        evt.stopImmediatePropagation();
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        var dblClickedElement = cellView.model;
        var elementType = dblClickedElement['attributes']['type'];
        switch(elementType) {
            case 'contrail.Chassis':
                break;
            case 'contrail.LineCard':
                var nodeDetails = dblClickedElement['attributes']['nodeDetails'];
                var no_of_line_cards = 0;
                var no_of_pfes = 0;
                var lineCards = [];
                var chassisId = "",slotIdentifier;
                if(null !== nodeDetails && typeof nodeDetails === "object") {
                    if(nodeDetails.hasOwnProperty('parentData')) {
                        chassisId = nodeDetails.parentData.getIdentifier();
                        lineCards = nodeDetails.parentData.getLineCards();
                        if(null !== lineCards && typeof lineCards === "object" && lineCards.length > 0) {
                            no_of_line_cards = lineCards.length;
                        } else {
                            lineCards = [];
                        }
                    } else {
                        return;
                    }
                    if(nodeDetails.hasOwnProperty('modelData')) {
                        var modelData = nodeDetails.modelData;
                        no_of_pfes = modelData.getPFECount();
                        slotIdentifier = modelData.getSlotIdentifier();
                        $.ajax({
                            url:'/api/tenant/networking/mx/fabric/stats?source=50.1.0.254&viewType=lineCard',
                            data:{
                                whereClause :[[{name:PRouterFieldPrefix+'src_slot',value:parseInt(slotIdentifier),op:1},{name:'Source',value:'50.1.0.254',op:1}],
                                              [{name:PRouterFieldPrefix+'dst_slot',value:parseInt(slotIdentifier),op:1}]]
                            },
                        }).done(function(response){
                            modelData.setStats(response['values'],[]);
                        }).fail(function(){
                            
                        });
                    } else {
                        return;
                    }
                } 
                var allEls = [];
                var chassisEl = graph.getCell(graph.getConnectedLinks(dblClickedElement)[0].attributes.target.id);
                allEls = allEls.concat(chassisEl);
                var packetForwardingEngineEls = [];
                var pfeToFabricLinkEls = [];
                for (var i=0; i<no_of_pfes; i++) {
                    var pfeObject = new PacketForwardingEngine();
                    pfeObject.setSlotIdentifier(i);
                    pfeObject.setParentObject(nodeDetails.modelData);
                    var packetForwardingEngineEl = _this.createNode({name: "chassis_" + chassisId + "_linecard_" + nodeDetails.modelData.getSlotIdentifier() + "_pfe_" + i, modelData: pfeObject, parentData: nodeDetails.modelData}, 'packet-forwarding-engine', no_of_line_cards, 0, 0, 0, 0, 0, i, 'line-card');
                    packetForwardingEngineEls.push(packetForwardingEngineEl);
                    for (var j=0; j<no_of_line_cards; j++) {
                        var pfeToFabricLinkEl = _this.createLink({modelData: {source: pfeObject, target: lineCards[j]}}, 'pfe-lc', packetForwardingEngineEls[i], chassisEl); 
                        pfeToFabricLinkEls.push(pfeToFabricLinkEl);
                    }
                }
                allEls = allEls.concat(packetForwardingEngineEls);
                allEls = allEls.concat(pfeToFabricLinkEls);
                graph.clear();
                $("#topology-connected-elements").find("div").remove();
                graph.addCells(allEls);
                var newGraphSize = joint.layout.DirectedGraph.layout(graph, {"rankDir" : "BT", "nodeSep" : 60, "rankSep" : 100});
                var svgHeight = newGraphSize.height;
                var svgWidth = newGraphSize.width;
                var viewAreaHeight = $("#topology-connected-elements").height();
                var viewAreaWidth = $("#topology-connected-elements").width();
                var offsetY = (viewAreaHeight - svgHeight)/2;
                var offsetX = (viewAreaWidth - svgWidth)/2;
                var offset = {
                    x: offsetX,
                    y: offsetY
                };

                $.each(allEls, function (elementKey, elementValue) {
                    elementValue.translate(offset.x, offset.y);
                });
                _this.renderUnderlayViz();
                break;
            case 'contrail.SwitchCard':
                break;
            case 'contrail.RoutingEngine':
                break;
            case 'contrail.PowerModule':
                break;
            case 'contrail.FanModule':
                break;
            case 'contrail.PacketForwardingEngine':
                var nodeDetails = dblClickedElement['attributes']['nodeDetails'];
                var dblClickedElementName = nodeDetails.name;
                var no_of_line_cards = 0;
                var no_of_pfes = 0;
                var lineCards = [];
                var chassisId = "";
                var total_pfe_count = 0;
                var packetForwardingEngineEls = [];
                var pfeTopfeLinkEls = [];
                var allEls = [],slotIdentifier,pfeId;
                packetForwardingEngineEls = packetForwardingEngineEls.concat(dblClickedElement);
                //dblClickedElement.transition($("#topology-connected-elements").width()/2, $("#topology-connected-elements").height()/2);
                if(null !== nodeDetails && typeof nodeDetails === "object") {
                    if(nodeDetails.hasOwnProperty('parentData')) {
                        slotIdentifier = nodeDetails.parentData.getSlotIdentifier();
                        pfeId = nodeDetails.modelData.slot_identifier;
                        chassisId = nodeDetails.parentData.getParentObject().getIdentifier();
                        lineCards = nodeDetails.parentData.getParentObject().getLineCards();
                        if(null !== lineCards && typeof lineCards === "object" && lineCards.length > 0) {
                            no_of_line_cards = lineCards.length;
                            for(var i=0; i<no_of_line_cards; i++) {
                                var lc = lineCards[i];
                                no_of_pfes = lc.getPFECount();
                                total_pfe_count += no_of_pfes;
                            }
                            for(var i=0; i<no_of_line_cards; i++) {
                                var lc = lineCards[i];
                                var pfeObjects = lc.getPFEObjects();
                                no_of_pfes = lc.getPFECount();
                                for(var j=0; j<no_of_pfes; j++) {
                                    var label = "chassis_" + chassisId + "_linecard_" + lc.getSlotIdentifier() +
                                        "_pfe_" + j;
                                    if(dblClickedElementName !== label) {
                                        var packetForwardingEngineEl = 
                                            _this.createNode({name: label, modelData: pfeObjects[j]}, 
                                                'packet-forwarding-engine', no_of_line_cards, 0, 0, 0, 0, total_pfe_count, j, 'pfe');
                                        packetForwardingEngineEls.push(packetForwardingEngineEl);
                                    }
                                }
                            }
                            allEls = allEls.concat(packetForwardingEngineEls);
                            for (var i=0; i<total_pfe_count; i++) {
                                for(var j=i+1; j<total_pfe_count; j++) {
                                    var pfeTopfeLinkEl = _this.createLink({modelData: {source: packetForwardingEngineEls[i].attributes.nodeDetails.modelData, target: packetForwardingEngineEls[j].attributes.nodeDetails.modelData}}, 'pfe-pfe', packetForwardingEngineEls[i], packetForwardingEngineEls[j]);
                                    pfeTopfeLinkEls.push(pfeTopfeLinkEl);
                                }
                            }
                            allEls = allEls.concat(pfeTopfeLinkEls);
                        } else {
                            lineCards = [];
                        }
                        $.ajax({
                            url:'/api/tenant/networking/mx/fabric/stats?source=50.1.0.254&viewType=pfe',
                            data:{
                                whereClause :[[{name:PRouterFieldPrefix+'src_slot',value:parseInt(slotIdentifier),op:1},{name:PRouterFieldPrefix+'src_pfe',value:parseInt(pfeId),op:1},
                                               {name:'Source',value:'50.1.0.254',op:1}],
                                              [{name:PRouterFieldPrefix+'dst_slot',value:parseInt(slotIdentifier),op:1},{name:PRouterFieldPrefix+'dst_pfe',value:parseInt(pfeId),op:1}]]
                            },
                        }).done(function(response){
                            nodeDetails.modelData.setStats(ifNull(response['values'],[]));
                        }).fail(function(){
                            
                        });
                    } else {
                        return;
                    }
                    if(nodeDetails.hasOwnProperty('modelData')) {
                        no_of_pfes = nodeDetails.parentData.getPFECount();
                    } else {
                        return;
                    }
                }
                graph.clear();
                $("#topology-connected-elements").find("div").remove();
                graph.addCells(allEls);
                var newGraphSize = joint.layout.DirectedGraph.layout(graph, {"rankDir" : "BT", "nodeSep" : 60, "rankSep" : 100});
                var svgHeight = newGraphSize.height;
                var svgWidth = newGraphSize.width;
                var viewAreaHeight = $("#topology-connected-elements").height();
                var viewAreaWidth = $("#topology-connected-elements").width();
                var offsetY = (viewAreaHeight - svgHeight)/2;
                var offsetX = (viewAreaWidth - svgWidth)/2;
                var offset = {
                    x: offsetX,
                    y: offsetY
                };

                $.each(allEls, function (elementKey, elementValue) {
                    elementValue.translate(offset.x, offset.y);
                });
                _this.renderUnderlayViz();
                break;
        }
    });

    paper.on('cell:pointerclick', function (cellView, evt, x, y) {
        evt.stopImmediatePropagation();
        //_this.clearHighlightedConnectedElements();
        var clickedElement = cellView.model;
        var elementType    = clickedElement['attributes']['type'];
        if(elementType === "link") {
            //_this.addHighlightToLink(clickedElement.id);
        } else {
            //_this.addHighlightToNode(clickedElement.id);    
        }
        
        timeout = setTimeout(function() {
            //trigger 'click' event after 'doubleclick' is initiated.
            var data           = {};

            switch(elementType) {
                case 'contrail.VirtualRouter':
                    var nodeDetails = clickedElement['attributes']['nodeDetails'];
                    data['hostName'] = "127.1.1.1";
                    data['type'] = 'VROUTER';
                    data['slot_identifier'] = nodeDetails['slot_identifier'];
                    data['model_type'] = nodeDetails['model_type'];
                    data['cpu_count'] = nodeDetails['cpu_count'];
                    
                    _this.populateDetailsTab(data);
                    break;
                case 'link':

                    var targetElement = graph.getCell(clickedElement['attributes']['target']['id']),
                        sourceElement = graph.getCell(clickedElement['attributes']['source']['id']);
                    var endpoints = [sourceElement['attributes']['nodeDetails']['name'],
                                     targetElement['attributes']['nodeDetails']['name']];
                    data['endpoints'] = endpoints;
                    data['type'] = 'link';
                    data['sourceElement'] = sourceElement;
                    data['targetElement'] = targetElement;
                    data['clickedElement'] = clickedElement;
                    _this.populateDetailsTab(data);
                    break;
                case 'contrail.Chassis':
                    var modelData = clickedElement['attributes']['nodeDetails']['modelData'];
                    data['name'] = ifNullOrEmpty(modelData['name'], 'Chassis');
                    data['type'] = 'Chassis';
                    $.extend(data, modelData);
                    _this.populateDetailsTab(data);
                    break;
                case 'contrail.RoutingEngine':
                    var modelData = clickedElement['attributes']['nodeDetails']['modelData'];
                    data['name'] = 'Routing Engine';
                    data['type'] = 'RoutingEngine';
                    $.extend(data, modelData);
                    _this.populateDetailsTab(data);
                    break;
                case 'contrail.SwitchCard':
                    var modelData = clickedElement['attributes']['nodeDetails']['modelData'];
                    data['name'] = 'Switch Card';
                    data['type'] = 'SwitchCard';
                    $.extend(data, modelData);
                    _this.populateDetailsTab(data);
                    break;
                case 'contrail.LineCard':
                    var modelData = clickedElement['attributes']['nodeDetails']['modelData'];
                    data['name'] = 'Line Card';
                    data['type'] = 'LineCard';
                    $.extend(data, modelData);
                    _this.populateDetailsTab(data);
                    break;
                case 'contrail.FanModule':
                    var modelData = clickedElement['attributes']['nodeDetails']['modelData'];
                    data['name'] = 'Fan Module';
                    data['type'] = 'FanModule';
                    $.extend(data, modelData);
                    _this.populateDetailsTab(data);
                    break;
                case 'contrail.PowerModule':
                    var modelData = clickedElement['attributes']['nodeDetails']['modelData'];
                    data['name'] = 'Power Module';
                    data['type'] = 'PowerModule';
                    $.extend(data, modelData);
                    _this.populateDetailsTab(data);
                    break;
                case 'contrail.PacketForwardingEngine':
                    //TBD
                    break;
                timeout = null;
            }
        }, 500);
    });
}


mxView.prototype.resetTopology = function() {
    this.renderUnderlayTabs();
    //this.clearHighlightedConnectedElements();
    $("#topology-connected-elements").panzoom("resetZoom");
    $("#topology-connected-elements").panzoom("reset");
    ZOOMED_OUT = 0;
}

mxView.prototype.renderTopology = function() {
    this.populateDomainBreadcrumbDropdown();
    this.renderUnderlayViz();
}

mxView.prototype.renderUnderlayViz = function() {
    this.initGraphEvents();
    this.initTooltipConfig();
}

mxView.prototype.addCommonTabs = function(tabDiv) {
    var _this = this;
    var tabObj = $("#"+tabDiv).data('contrailTabs');
    tabObj.addTab('traceFlow','Detail',{position: 'before'});
    tabObj.addTab('flows-tab','Link',{position: 'before'});
    $("#"+tabDiv).on('tabsactivate',function(e,ui){
        var selTab = $(ui.newTab.context).text();
        if(selTab == 'Detail') {

        }
        else if(selTab == 'Link') {

        }
    });
}

mxView.prototype.renderUnderlayTabs = function() {
    var _this = this;
    $("#underlayTabs").html(Handlebars.compile($("#underlay-tabs").html()));
    $("#underlay_tabstrip").contrailTabs({
        activate:function (e, ui) {
            var selTab = $(ui.newTab.context).text();
            if (selTab == 'Details MX') {
                _this.renderMxDetails();
            } else if (selTab == 'Trace Flows') {
            } else if (selTab == 'Details') {
            }
        }
    });
}

mxView.prototype.renderMxDetails = function(){
    content = {};
    var model = this.getModel();
    var data = model.getProuterChassises(),tmpProuterData;
    for(var i=0; i<data.length; i++) {
        if(data[i].getIdentifier() === $("#prouter_chassises").val()) {
            tmpProuterData = data[i];
            break;
     }   
    }
    content['hostName'] = "127.0.0.1";
    content['max_line_cards'] = ifNull(tmpProuterData['max_line_cards'],0);
    content['identifier'] = ifNull(tmpProuterData['identifier'],0);
    content['model_type'] = ifNull(tmpProuterData['model_type'],0);
    content['type'] = 'mx';
    
    details = Handlebars.compile($("#device-summary-template").html())(content);
    $("#detailsmxTab").html(details);
}

mxView.prototype.populateDetailsTab = function(data) {
    var type = data['type'],details,content = {},_this = this;
    var widget_template = contrail.getTemplate4Id("device-details-widget"),
        details_template = contrail.getTemplate4Id("device-details-body");
    $("#detailsLink").show();
    $("#underlay_tabstrip").tabs({active:1}); 
    if(type != 'link')
        $("#detailsLink").find('a.ui-tabs-anchor').html("Details");
    if (type == 'Chassis') {
        $("#detailsTab").html(widget_template({
            title: 'Chassis',
            colCount: 2,
            showSettings: true,
            widgetBoxId: 'deviceDetails'
        }));
        startWidgetLoading('deviceDetails');
        var attrs = [{
            label: 'Name',
            value: data['name']
        }, {
            label: 'Identifier',
            value: data['identifier']
        }, {
            label: 'Model',
            value: data['model_type']
        }, {
            label: 'RE Count',
            value: data['max_routing_engines']
        }];
        //REs
        $.each(data['routing_engines'], function(idx, re) {
           attrs.push({
               label: 'Routing Engine ' + idx,
               value: ' '
           }, {
               label: INDENT_RIGHT + 'Slot Identifier',
               value: re['slot_identifier']
           }, {
               label: INDENT_RIGHT + 'Model',
               value: re['model_type']
           });
        });
        //SWs
        attrs.push({
            label: 'SW Count',
            value: data['max_switch_cards']
        });
        $.each(data['switch_cards'], function(idx, sw) {
            attrs.push({
                label: 'Switch Card ' + idx,
                value: ' '
            }, {
                label: INDENT_RIGHT + 'Slot Identifier',
                value: sw['slot_identifier']
            }, {
                label: INDENT_RIGHT + 'Model',
                value: sw['model_type']
            });
        });
        //LCs
        attrs.push({
            label: 'LC Count',
            value: data['max_line_cards']
        });
        $.each(data['line_cards'], function(idx, lc) {
            attrs.push({
                label: 'Line Card ' + idx,
                value: ' '
            }, {
                label: INDENT_RIGHT + 'Slot Identifier',
                value: lc['slot_identifier']
            }, {
                label: INDENT_RIGHT + 'Model',
                value: lc['model_type']
            }, {
                label: INDENT_RIGHT + 'CPU Count',
                value: lc['cpu_count']
            }, {
                label: INDENT_RIGHT + 'PFE Count',
                value: lc['pfe_count']
            });
        });
        //Fans
        attrs.push({
            label: 'Fan Count',
            value: data['max_fan_modules']
        });
        $.each(data['fan_modules'], function(idx, fan) {
            attrs.push({
                label: 'Fan ' + idx,
                value: ' '
            }, {
                label: INDENT_RIGHT + 'Description',
                value: fan['description']
            })
        });
        //PSUs
        attrs.push({
            label: 'PSU Count',
            value: data['max_power_modules']
        });
        $.each(data['power_modules'], function(idx, psu) {
            attrs.push({
                label: 'PSU ' + idx,
                value: ' '
            }, {
                label: INDENT_RIGHT + 'Serial Number',
                value: psu['serial_number']
            }, {
                label: INDENT_RIGHT + 'Model',
                value: psu['model_type']
            })
        });

        $('#dashboard-box .widget-body').html(details_template({
            attributes: attrs,
            deviceData: attrs,
            showSettings: true
        }));
        endWidgetLoading('deviceDetails');

        $("#underlay_tabstrip").on('tabsactivate',function(e,ui){
            var selTab = $(ui.newTab.context).text();
        });

    } else if (type == 'RoutingEngine') {
        $("#detailsTab").html(widget_template({
            title: 'Routing Engine',
            colCount: 2,
            showSettings: true,
            widgetBoxId: 'deviceDetails'
        }));
        startWidgetLoading('deviceDetails');
        var attrs = [{
            label: 'Slot Identifier',
            value: data['slot_identifier']
        }, {
            label: 'Model',
            value: data['model_type']
        }];
        $('#dashboard-box .widget-body').html(details_template({
            attributes: attrs,
            deviceData: attrs,
            showSettings: true
        }));
        endWidgetLoading('deviceDetails');
        $("#underlay_tabstrip").on('tabsactivate',function(e,ui){
            var selTab = $(ui.newTab.context).text();
        });
    } else if (type == 'SwitchCard') {
        $("#detailsTab").html(widget_template({
            title: 'Switch Card',
            colCount: 2,
            showSettings: true,
            widgetBoxId: 'deviceDetails'
        }));
        startWidgetLoading('deviceDetails');
        var attrs = [{
            label: 'Slot Identifier',
            value: data['slot_identifier']
        }, {
            label: 'Model',
            value: data['model_type']
        }];
        $('#dashboard-box .widget-body').html(details_template({
            attributes: attrs,
            deviceData: attrs,
            showSettings: true
        }));
        endWidgetLoading('deviceDetails');
        $("#underlay_tabstrip").on('tabsactivate',function(e,ui){
            var selTab = $(ui.newTab.context).text();
        });
    } else if (type == 'LineCard') {
        $("#detailsTab").html(widget_template({
            title: 'Line Card',
            colCount: 2,
            showSettings: true,
            widgetBoxId: 'deviceDetails'
        }));
        startWidgetLoading('deviceDetails');
        var attrs = [{
            label: 'Slot Identifier',
            value: data['slot_identifier']
        }, {
            label: 'Model',
            value: data['model_type']
        }, {
            label: 'CPU Count',
            value: data['cpu_count']
        }, {
            label: 'PFE Count',
            value: data['pfe_count']
        }];
        $('#dashboard-box .widget-body').html(details_template({
            attributes: attrs,
            deviceData: attrs,
            showSettings: true
        }));
        endWidgetLoading('deviceDetails');
        $("#underlay_tabstrip").on('tabsactivate',function(e,ui){
            var selTab = $(ui.newTab.context).text();
        });
    } else if (type == 'FanModule') {
        $("#detailsTab").html(widget_template({
            title: 'Fan Module',
            colCount: 2,
            showSettings: true,
            widgetBoxId: 'deviceDetails'
        }));
        startWidgetLoading('deviceDetails');
        var attrs = [{
            label: 'Description',
            value: data['description']
        }];
        $('#dashboard-box .widget-body').html(details_template({
            attributes: attrs,
            deviceData: attrs,
            showSettings: true
        }));
        endWidgetLoading('deviceDetails');
        $("#underlay_tabstrip").on('tabsactivate',function(e,ui){
            var selTab = $(ui.newTab.context).text();
        });
    } else if (type == 'PowerModule') {
        $("#detailsTab").html(widget_template({
            title: 'Power Module',
            colCount: 2,
            showSettings: true,
            widgetBoxId: 'deviceDetails'
        }));
        startWidgetLoading('deviceDetails');
        var attrs = [{
            label: 'Serial Number',
            value: data['serial_number']
        }, {
            label: 'Model',
            value: data['model_type']
        }];
        $('#dashboard-box .widget-body').html(details_template({
            attributes: attrs,
            deviceData: attrs,
            showSettings: true
        }));
        endWidgetLoading('deviceDetails');
        $("#underlay_tabstrip").on('tabsactivate',function(e,ui){
            var selTab = $(ui.newTab.context).text();
        });
    } else if (type == 'link') {
        var clickedElement = data['clickedElement'],linkAttributes,url;
        var divId = 'detailsTab';
        var options = {
                height:300,
                yAxisLabel: 'Bytes per 30 secs',
                y2AxisLabel: 'Bytes per min',
                defaultSelRange: 2 //(latest 2 samples)
          };
        if(clickedElement != null) {
            $("#detailsLink").find('a.ui-tabs-anchor').html("Traffic Statistics");
            linkAttributes = getValueByJsonPath(clickedElement,'attributes;linkDetails',{});
            if(linkAttributes != null && linkAttributes.link_type == 'lc-lc' && linkAttributes.modelData != null &&
                    linkAttributes.modelData.source instanceof LineCard && linkAttributes.modelData.target instanceof LineCard) {
                var srcSlotIdentifier = getValueByJsonPath(linkAttributes,'modelData;source;slot_identifier','-');
                var dstSlotIdentifier = getValueByJsonPath(linkAttributes,'modelData;target;slot_identifier','-');
                $("#"+divId).html(Handlebars.compile($("#mx-timeseries-chart-template").html())
                        ({title:contrail.format('Traffic Statistics of Slot Identifer({0} <--> {1})',srcSlotIdentifier,dstSlotIdentifier)}));
                if($.isNumeric(srcSlotIdentifier) && $.isNumeric(dstSlotIdentifier)) {
                    url = '/api/tenant/networking/mx/fabric/tsstats?source=50.1.0.254&src_slot='+srcSlotIdentifier+'&dst_slot='
                           +dstSlotIdentifier+'&T=60&endTime=now&minsSince=60';
                } else {
                    return;
                }
            } else if (linkAttributes != null && linkAttributes.link_type == 'pfe-lc' && linkAttributes.modelData != null 
                    && linkAttributes.modelData.source instanceof PacketForwardingEngine && linkAttributes.modelData.target instanceof LineCard){
                var srcPFEIdentifier = getValueByJsonPath(linkAttributes,'modelData;source;slot_identifier','-');
                var srcSlotIdentifier = getValueByJsonPath(linkAttributes,'modelData;source;linecard;slot_identifier','-');
                var dstSlotIdentifier = getValueByJsonPath(linkAttributes,'modelData;target;slot_identifier','-');
                $("#"+divId).html(Handlebars.compile($("#mx-timeseries-chart-template").html())(
                        {title:contrail.format('Traffic Statistics of Slot Identifer ({0}) PFE ({1}) <--> Slot Identifier ({2})',
                                srcSlotIdentifier,srcPFEIdentifier,dstSlotIdentifier)}));
                if($.isNumeric(srcSlotIdentifier) && $.isNumeric(srcPFEIdentifier) && $.isNumeric(dstSlotIdentifier)) {
                    url = '/api/tenant/networking/mx/fabric/tsstats?source=50.1.0.254&src_slot='+srcSlotIdentifier+'&src_pfe='+srcPFEIdentifier+
                        '&dst_slot='+dstSlotIdentifier+'&T=60&endTime=now&minsSince=60';
                } else {
                    return;
                }
            } else if (linkAttributes != null && linkAttributes.link_type == 'pfe-pfe' && linkAttributes.modelData != null
                    && linkAttributes.modelData.source instanceof PacketForwardingEngine && linkAttributes.modelData.target instanceof PacketForwardingEngine){
                var srcPFEIdentifier = getValueByJsonPath(linkAttributes,'modelData;source;slot_identifier','-');
                var srcSlotIdentifier = getValueByJsonPath(linkAttributes,'modelData;source;linecard;slot_identifier','-');
                var dstSlotIdentifier = getValueByJsonPath(linkAttributes,'modelData;target;linecard;slot_identifier','-');
                var dstPFEIdentifier = getValueByJsonPath(linkAttributes,'modelData;target;slot_identifier','-');
                $("#"+divId).html(Handlebars.compile($("#mx-timeseries-chart-template").html())(
                        {title:contrail.format('Traffic Statistics of Slot Identifer ({0}) PFE ({1}) <--> Slot Identifier ({2}) PFE ({3})',
                                srcSlotIdentifier,srcPFEIdentifier,dstSlotIdentifier,dstPFEIdentifier)}));
                if($.isNumeric(srcSlotIdentifier) && $.isNumeric(srcPFEIdentifier) && $.isNumeric(dstSlotIdentifier) && $.isNumeric(dstPFEIdentifier)) {
                    url = '/api/tenant/networking/mx/fabric/tsstats?source=50.1.0.254&src_slot='+srcSlotIdentifier+'&src_pfe='+srcPFEIdentifier+
                    '&dst_slot='+dstSlotIdentifier+'&dst_pfe='+dstPFEIdentifier+'&T=60&endTime=now&minsSince=60';
                } else {
                    return;
                }
            }
            $.ajax({
                url: url
            }).success(function(response){
                $("#mx-timeseries").find('.icon-spinner').hide();
                response = ifNull(response,[]),inBytesArr = [],outBytesArr = [],chartData = [];
                $.each(response,function(i,obj){
                    var values = ifNull(obj['values'],[]);
                    var timeStamp = $.isNumeric(obj['ts']) ? obj['ts']/1000 : '-';
                    $.each(values['src_aggregate'],function(j,statObj){
                        var pfeStats = ifNull(statObj,[]),outBytes = 0;
                        $.each(pfeStats,function(k,pfeStatObj){
                            outBytes += ifNull(pfeStatObj[statsResponseBytesKey],0);
                        });
                        outBytesArr.push({x:timeStamp,y:outBytes});
                    });
                    $.each(values['dst_aggregate'],function(j,statObj){
                        var pfeStats = ifNull(statObj,[]),inBytes = 0;
                        $.each(pfeStats,function(k,pfeStatObj){
                            inBytes += ifNull(pfeStatObj[statsResponseBytesKey],0);
                        });
                        inBytesArr.push({x: timeStamp,y: inBytes});
                    });
                });
                chartData.push({key:contrail.format('Slot Identifier({0} --> {1})',srcSlotIdentifier,dstSlotIdentifier),values:outBytesArr});
                chartData.push({key:contrail.format('Slot Identifier({0} --> {1})',dstSlotIdentifier,srcSlotIdentifier),values:inBytesArr});
                initTrafficTSChart('#mx-timeseries-chart', chartData, options, null, "formatSumPackets", "formatSumPackets");
            }).fail(function(){
                $("#mx-timeseries-chart").html('<p class="error">Error in fetching details</p>');
            });
        }
    }
}

mxView.prototype.resizeTopology = function() {
    var topologySize = mxRenderer.getView().calculateDimensions(false);
    mxRenderer.getView().setDimensions(topologySize);
}

mxView.prototype.expandTopology = function() {
    var topologySize = this.calculateDimensions(expanded);
    this.setDimensions(topologySize);
    this.getPaper().setDimensions($("#topology-connected-elements").width(), $("#topology-connected-elements").height());
    var graph = this.getGraph();
    var newGraphSize = graph.getBBox(graph.getElements());
    var offset = {
        x: (($("#topology-connected-elements").width() - newGraphSize.width)/2) - newGraphSize.x,
        y: (($("#topology-connected-elements").height() - newGraphSize.height)/2) - newGraphSize.y
    };
    $.each(graph.getElements(), function (elementKey, elementValue) {
        elementValue.translate(offset.x, offset.y);
    });
    expanded = !expanded;
}


mxView.prototype.destroy = function() {
    this.connectedElements = [];
    this.elementMap        = {
        nodes: {},
        links: {}
    };
    var vizTemplate = $("#visualization-template");
    if(isSet(vizTemplate)) {
        vizTemplate.remove();
        vizTemplate = $();
    }
}



var mxController = function (model, view) {
    this.model = model || new mxModel();
    this.view  = view  || new new mxView(this._model);
}

mxController.prototype.getModel = function() {
    return this.model;
}

mxController.prototype.getView = function() {
    return this.view;
}

mxController.prototype.getModelData = function(cfg) {
    var _this  = this,url = '/api/tenant/networking/mxtopology';
    $("#underlay_topology").find('.topology-visualization-loading').show();

    var tmpCfg = {
        url      : url,
        type     : "GET",
        callback : function (response) {
            //removing the progress bar
            $("#network_topology").find('.topology-visualization-loading').hide();
            if(null != response) {
                topologyCallback(response);
            } else {
                showEmptyInfo('network_topology');
            }

        },
        //Calling the force refresh call on failure of the cache call
        failureCallback : function (err) {
            $("#network_topology").find('.topology-visualization-loading').hide();
            showEmptyInfo('network_topology');
        }
    };
    function showEmptyInfo(container) {
        $("#"+container).html('<div class="display-nonodes">No Physical Routers found</div>');
    }
    function topologyCallback(response){
        globalObj['topologyResponse'] = response;
        _this.getModel().processData(response);

        _this.getView().renderTopology(response);
        _this.getView().renderMxDetails();
    }
    if(null !== cfg && typeof cfg !== "undefined")
        this.getModel().getData(cfg);
    else
        this.getModel().getData(tmpCfg);
}

mxController.prototype.destroy = function() {
    //tbd
}
