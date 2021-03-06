/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var MonitorAlarmsView = Backbone.View.extend({
        el: $(contentContainer),
        renderAlarms: function (viewConfig) {
            cowu.renderView4Config(this.$el, null, getAlarmsConfig());
        }
    });

    function getAlarmsConfig() {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_ALARMS_PAGE_ID]),
            view: "AlarmListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {}
        }
    };
    return MonitorAlarmsView;
});