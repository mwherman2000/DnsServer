/*
Technitium DNS Server
Copyright (C) 2019  Shreyas Zare (shreyas@technitium.com)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

function refreshZones(checkDisplay) {
    if (checkDisplay == null)
        checkDisplay = false;

    var divViewZones = $("#divViewZones");

    if (checkDisplay && (divViewZones.css('display') === "none"))
        return;

    var divViewZonesLoader = $("#divViewZonesLoader");
    var divEditZone = $("#divEditZone");

    divViewZones.hide();
    divEditZone.hide();
    divViewZonesLoader.show();

    HTTPRequest({
        url: "/api/listZones?token=" + token,
        success: function (responseJSON) {
            var zones = responseJSON.response.zones;
            var tableHtmlRows = "";

            for (var i = 0; i < zones.length; i++) {
                var id = Math.floor(Math.random() * 10000);
                var zoneName = zones[i].zoneName;

                if (zoneName === "")
                    zoneName = ".";

                tableHtmlRows += "<tr id=\"trZone" + id + "\"><td>" + htmlEncode(zoneName) + "</td>";
                tableHtmlRows += "<td align=\"right\"><button type=\"button\" class=\"btn btn-primary\" style=\"font-size: 12px; padding: 2px 0px; width: 60px; margin: 0 6px 6px 0;\" onclick=\"showEditZone('" + zoneName + "');\">Edit</button>";
                tableHtmlRows += "<button type=\"button\" data-id=\"" + id + "\" id=\"btnEnableZone" + id + "\" class=\"btn btn-default\" style=\"font-size: 12px; padding: 2px 0px; width: 60px; margin: 0 6px 6px 0;" + (zones[i].disabled ? "" : " display: none;") + "\" onclick=\"enableZone(this, '" + zoneName + "');\" data-loading-text=\"Enabling...\">Enable</button>";
                tableHtmlRows += "<button type=\"button\" data-id=\"" + id + "\" id=\"btnDisableZone" + id + "\" class=\"btn btn-warning\" style=\"font-size: 12px; padding: 2px 0px; width: 60px; margin: 0 6px 6px 0;" + (!zones[i].disabled ? "" : " display: none;") + "\" onclick=\"disableZone(this, '" + zoneName + "');\" data-loading-text=\"Disabling...\">Disable</button>";
                tableHtmlRows += "<button type=\"button\" data-id=\"" + id + "\" class=\"btn btn-danger\" style=\"font-size: 12px; padding: 2px 0px; width: 60px; margin: 0 6px 6px 0;\" onclick=\"deleteZone(this, '" + zoneName + "');\" data-loading-text=\"Deleting...\">Delete</button></td></tr>";
            }

            $("#tableZonesBody").html(tableHtmlRows);

            if (zones.length > 0)
                $("#tableZonesFooter").html("<tr><td colspan=\"2\"><b>Total Zones: " + zones.length + "</b></td></tr>");
            else
                $("#tableZonesFooter").html("<tr><td colspan=\"2\" align=\"center\">No Zones Found</td></tr>");

            divViewZonesLoader.hide();
            divViewZones.show();
        },
        error: function () {
            divViewZonesLoader.hide();
            divViewZones.show();
        },
        invalidToken: function () {
            showPageLogin();
        },
        objLoaderPlaceholder: divViewZonesLoader
    });
}

function enableZone(objBtn, domain) {
    var btn = $(objBtn);
    var id = btn.attr("data-id");

    btn.button('loading');

    HTTPRequest({
        url: "/api/enableZone?token=" + token + "&domain=" + encodeURIComponent(domain),
        success: function (responseJSON) {
            btn.button('reset');

            $("#btnEnableZone" + id).hide();
            $("#btnDisableZone" + id).show();

            showAlert("success", "Zone Enabled!", "Zone was enabled successfully.");
        },
        error: function () {
            btn.button('reset');
        },
        invalidToken: function () {
            showPageLogin();
        }
    });
}

function disableZone(objBtn, domain) {
    if (!confirm("Are you sure you want to disable the zone '" + domain + "'?"))
        return false;

    var btn = $(objBtn);
    var id = btn.attr("data-id");

    btn.button('loading');

    HTTPRequest({
        url: "/api/disableZone?token=" + token + "&domain=" + encodeURIComponent(domain),
        success: function (responseJSON) {
            btn.button('reset');

            $("#btnEnableZone" + id).show();
            $("#btnDisableZone" + id).hide();

            showAlert("success", "Zone Disabled!", "Zone was disabled successfully.");
        },
        error: function () {
            btn.button('reset');
        },
        invalidToken: function () {
            showPageLogin();
        }
    });
}

function deleteZone(objBtn, domain) {
    if (!confirm("Are you sure you want to permanently delete the zone '" + domain + "' and all its records?"))
        return false;

    var btn = $(objBtn);
    var id = btn.attr("data-id");

    btn.button('loading');

    HTTPRequest({
        url: "/api/deleteZone?token=" + token + "&domain=" + encodeURIComponent(domain),
        success: function (responseJSON) {
            $("#trZone" + id).remove();

            var totalZones = $('#tableZones >tbody >tr').length;

            if (totalZones > 0)
                $("#tableZonesFooter").html("<tr><td colspan=\"2\"><b>Total Zones: " + totalZones + "</b></td></tr>");
            else
                $("#tableZonesFooter").html("<tr><td colspan=\"2\" align=\"center\">No Zones Found</td></tr>");

            showAlert("success", "Zone Deleted!", "Zone was deleted successfully.");
        },
        error: function () {
            btn.button('reset');
        },
        invalidToken: function () {
            showPageLogin();
        }
    });
}

function showAddZoneModal() {
    $("#divAddZoneAlert").html("");

    $("#txtAddZone").val("");
    $("#btnAddZone").button('reset');

    $("#modalAddZone").modal("show");
}

function addZone() {
    var divAddZoneAlert = $("#divAddZoneAlert");
    var domain = $("#txtAddZone").val();

    if ((domain === null) || (domain === "")) {
        showAlert("warning", "Missing!", "Please enter a domain name to add zone.", divAddZoneAlert);
        $("#txtAddZone").focus();
        return;
    }

    var btn = $("#btnAddZone").button('loading');

    HTTPRequest({
        url: "/api/createZone?token=" + token + "&domain=" + encodeURIComponent(domain),
        success: function (responseJSON) {
            $("#modalAddZone").modal("hide");
            showEditZone(domain);

            showAlert("success", "Zone Added!", "Zone was added successfully.");
        },
        error: function () {
            btn.button('reset');
        },
        invalidToken: function () {
            showPageLogin();
        },
        objAlertPlaceholder: divAddZoneAlert
    });
}

function showAddDIDMethodModal() { // TODO Customize - currently jusst a copy of showAddZoneModal()
    $("#divAddDIDMethodAlert").html("");

    $("#txtAddDIDMethod").val("");
    $("#btnAddDIDMethod").button('reset');

    $("#modalAddDIDMethod").modal("show");
}

function addDIDMethod() {
    var divAddDIDMethodAlert = $("#divAddDIDMethodAlert");
    var domain = $("#txtAddDIDMethod").val();

    if ((domain === null) || (domain === "")) {
        showAlert("warning", "Missing!", "Please enter a name DID Method.", divAddDIDMethodAlert);
        $("#txtAddDIDMethod").focus();
        return;
    }

    var idid = domain.indexOf("did:");
    if (idid == 0) {
        var didvalue = domain.substring(4);
        var didlabels = didvalue.split(":");
        var diddomain = "";
        var i;
        for (i = didlabels.length - 1; i >= 0; i--) {
            diddomain = diddomain.concat(didlabels[i]);
            if (i > 0) diddomain = diddomain.concat(".");
        }
        diddomain = diddomain.concat(".did");
        domain = diddomain;

        $("#txtAddDIDMethod").val(domain);
    }

    var btn = $("#btnAddDIDMethod").button('loading');

    HTTPRequest({
        url: "/api/createDIDMethod?token=" + token + "&domain=" + encodeURIComponent(domain),
        success: function (responseJSON) {
            $("#modalAddDIDMethod").modal("hide");
            showEditZone(domain);

            showAlert("success", "DID Method Added!", "DID Method was added successfully.");
        },
        error: function () {
            btn.button('reset');
        },
        invalidToken: function () {
            showPageLogin();
        },
        objAlertPlaceholder: divAddDIDMethodAlert
    });
}

function showEditZone(domain) {
    var divViewZonesLoader = $("#divViewZonesLoader");
    var divViewZones = $("#divViewZones");
    var divEditZone = $("#divEditZone");

    divViewZones.hide();
    divEditZone.hide();
    divViewZonesLoader.show();

    HTTPRequest({
        url: "/api/getRecords?token=" + token + "&domain=" + encodeURIComponent(domain),
        success: function (responseJSON) {
            var records = responseJSON.response.records;
            var tableHtmlRows = "";

            for (var i = 0; i < records.length; i++) {
                var id = Math.floor(Math.random() * 10000);

                var name = records[i].name;
                var nameLowerCase = name.toLowerCase();
                if (nameLowerCase === "")
                    name = ".";

                if (nameLowerCase === domain)
                    name = "@";
                else
                    name = name.replace("." + domain, "");

                tableHtmlRows += "<tr id=\"tr" + id + "\"><td>" + htmlEncode(name) + "</td>";
                tableHtmlRows += "<td>" + records[i].type + "</td>";
                tableHtmlRows += "<td>" + records[i].ttl + "</td>";

                var additionalDataAttributes = "";

                switch (records[i].type.toUpperCase()) {
                    case "A":
                    case "NS":
                    case "CNAME":
                    case "PTR":
                    case "TXT":
                    case "AAAA":
                        tableHtmlRows += "<td>" + htmlEncode(records[i].attributes.value) + "</td>";
                        break;

                    case "DIDID": // mwh
                        tableHtmlRows += "<td>" + htmlEncode(records[i].attributes.value) + "</td>";
                        break;

                    case "DIDTXT": // mwh
                        tableHtmlRows +=
                            "<td>  <b>Tag:</b> " + htmlEncode(records[i].attributes.didTag) +
                            "<br /><b>Text DID:</b> " + htmlEncode(records[i].attributes.didDID) +
                            "<br /><b>Text Data:</b> " + htmlEncode(records[i].attributes.value) + "</td>";

                        additionalDataAttributes =
                            "data-record-didTag=\"" + htmlEncode(records[i].attributes.didTag) + "\" " +
                            "data-record-didDID=\"" + htmlEncode(records[i].attributes.didDID) + "\" ";
                        break;

                    case "DIDCTX": // mwh
                        tableHtmlRows +=
                            "<td>  <b>Tag:</b> " + htmlEncode(records[i].attributes.didTag) +
                            "<br /><b>CTX URI:</b> " + htmlEncode(records[i].attributes.value) + "</td>";

                        additionalDataAttributes =
                            "data-record-didTag=\"" + htmlEncode(records[i].attributes.didTag) + "\" ";
                        break;

                    case "DIDSUBSIG": // mwh
                        tableHtmlRows +=
                            "<td>  <b>Tag:</b> " + htmlEncode(records[i].attributes.didTag) +
                            "<br /><b>Sig DID:</b> " + htmlEncode(records[i].attributes.didDID) +
                            "<br /><b>Sig Data:</b> " + htmlEncode(records[i].attributes.value) + "</td>";

                        additionalDataAttributes =
                            "data-record-didTag=\"" + htmlEncode(records[i].attributes.didTag) + "\" " +
                            "data-record-didDID=\"" + htmlEncode(records[i].attributes.didDID) + "\" ";
                        break;

                    case "DIDSVC": // mwh
                        tableHtmlRows +=
                            "<td>  <b>Tag:</b> " + htmlEncode(records[i].attributes.didTag) +
                            "<br /><b>SVC DID:</b> " + htmlEncode(records[i].attributes.didDID) +
                            "<br /><b>Type:</b> " + htmlEncode(records[i].attributes.didType) +
                            "<br /><b>Description:</b> " + htmlEncode(records[i].attributes.didDescription) +
                            "<br /><b>Service Endpoint URL:</b> " + htmlEncode(records[i].attributes.value) + "</td>";

                        additionalDataAttributes =
                            "data-record-didTag=\"" + htmlEncode(records[i].attributes.didTag) + "\" " +
                            "data-record-didDID=\"" + htmlEncode(records[i].attributes.didDID) + "\" " +
                            "data-record-didType=\"" + htmlEncode(records[i].attributes.didType) + "\" " +
                            "data-record-didDescription=\"" + htmlEncode(records[i].attributes.didDescription) + "\" ";
                        break;

                    case "DIDPUBK": // mwh 
                        tableHtmlRows += 
                            "<td>  <b>Tag:</b> " + htmlEncode(records[i].attributes.didTag) +
                            "<br /><b>PUBK DID:</b> " + htmlEncode(records[i].attributes.didDID) +
                            "<br /><b>Type:</b> " + htmlEncode(records[i].attributes.didType) +
                            "<br /><b>Public Key:</b> " + htmlEncode(records[i].attributes.value) +
                            "<br /><b>Controller DID:</b> " + htmlEncode(records[i].attributes.didControllerDID) + "</td>";

                        additionalDataAttributes =
                            "data-record-didTag=\"" + htmlEncode(records[i].attributes.didTag) + "\" " +
                            "data-record-didDID=\"" + htmlEncode(records[i].attributes.didDID) + "\" " +
                            "data-record-didType=\"" + htmlEncode(records[i].attributes.didType) + "\" " +
                            "data-record-didControllerDID=\"" + htmlEncode(records[i].attributes.didControllerDID) + "\" ";
                        break;

                    case "DIDEXTDAT": // mwh
                        tableHtmlRows +=
                            "<td>  <b>Tag:</b> " + htmlEncode(records[i].attributes.didTag) +
                            "<br /><b>EXTDAT DID:</b> " + htmlEncode(records[i].attributes.didDID) +
                            "<br /><b>Type:</b> " + htmlEncode(records[i].attributes.didType) +
                            "<br /><b>Data Source:</b> " + htmlEncode(records[i].attributes.value) +
                            "<br /><b>Query:</b> " + htmlEncode(records[i].attributes.didQuery) +
                            "<br /><b>Parms:</b> " + htmlEncode(records[i].attributes.didParms) + "</td>";

                        additionalDataAttributes =
                            "data-record-didTag=\"" + htmlEncode(records[i].attributes.didTag) + "\" " +
                            "data-record-didDID=\"" + htmlEncode(records[i].attributes.didDID) + "\" " +
                            "data-record-didType=\"" + htmlEncode(records[i].attributes.didType) + "\" " +
                            "data-record-didQuery=\"" + htmlEncode(records[i].attributes.didQuery) + "\" " +
                            "data-record-didParms=\"" + htmlEncode(records[i].attributes.didParms) + "\" ";
                        break;

                    case "DIDATHN": // mwh
                        tableHtmlRows +=
                            "<td>  <b>Tag:</b> " + htmlEncode(records[i].attributes.didTag) +
                            "<br /><b>ATHN DID:</b> " + htmlEncode(records[i].attributes.didDID) +
                            "<br /><b>Type:</b> " + htmlEncode(records[i].attributes.didType) +
                            "<br /><b>Public Key:</b> " + htmlEncode(records[i].attributes.value) +
                            "<br /><b>Controller DID:</b> " + htmlEncode(records[i].attributes.didControllerDID) + "</td>";

                        additionalDataAttributes =
                            "data-record-didTag=\"" + htmlEncode(records[i].attributes.didTag) + "\" " +
                            "data-record-didDID=\"" + htmlEncode(records[i].attributes.didDID) + "\" " +
                            "data-record-didType=\"" + htmlEncode(records[i].attributes.didType) + "\" " +
                            "data-record-didControllerDID=\"" + htmlEncode(records[i].attributes.didControllerDID) + "\" ";
                        break;

                    case "UUBLAddress":
                        tableHtmlRows += "<td>" + htmlEncode(records[i].attributes.value) + "</td>";
                        break;

                    case "SOA":
                        tableHtmlRows += "<td><b>Master Name Server:</b> " + htmlEncode(records[i].attributes.masterNameServer) +
                            "<br /><b>Responsible Person:</b> " + htmlEncode(records[i].attributes.responsiblePerson) +
                            "<br /><b>Serial:</b> " + htmlEncode(records[i].attributes.serial) +
                            "<br /><b>Refresh:</b> " + htmlEncode(records[i].attributes.refresh) +
                            "<br /><b>Retry:</b> " + htmlEncode(records[i].attributes.retry) +
                            "<br /><b>Expire:</b> " + htmlEncode(records[i].attributes.expire) +
                            "<br /><b>Minimum:</b> " + htmlEncode(records[i].attributes.minimum) + "</td>";

                        additionalDataAttributes = "data-record-mname=\"" + htmlEncode(records[i].attributes.masterNameServer) + "\" " +
                            "data-record-rperson=\"" + htmlEncode(records[i].attributes.responsiblePerson) + "\" " +
                            "data-record-serial=\"" + htmlEncode(records[i].attributes.serial) + "\" " +
                            "data-record-refresh=\"" + htmlEncode(records[i].attributes.refresh) + "\" " +
                            "data-record-retry=\"" + htmlEncode(records[i].attributes.retry) + "\" " +
                            "data-record-expire=\"" + htmlEncode(records[i].attributes.expire) + "\" " +
                            "data-record-minimum=\"" + htmlEncode(records[i].attributes.minimum) + "\" ";
                        break;

                    case "MX":
                        tableHtmlRows += "<td><b>Preference: </b> " + htmlEncode(records[i].attributes.preference) +
                            "<br /><b>Exchange:</b> " + htmlEncode(records[i].attributes.value) + "</td>";

                        additionalDataAttributes = "data-record-preference=\"" + htmlEncode(records[i].attributes.preference) + "\" ";
                        break;

                    case "SRV":
                        tableHtmlRows += "<td><b>Priority:</b> " + htmlEncode(records[i].attributes.priority) +
                            "<br /><b>Weight:</b> " + htmlEncode(records[i].attributes.weight) +
                            "<br /><b>Port:</b> " + htmlEncode(records[i].attributes.port) +
                            "<br /><b>Target:</b> " + htmlEncode(records[i].attributes.value) + "</td>";

                        additionalDataAttributes = "data-record-priority=\"" + htmlEncode(records[i].attributes.priority) + "\" " +
                            "data-record-weight=\"" + htmlEncode(records[i].attributes.weight) + "\" " +
                            "data-record-port=\"" + htmlEncode(records[i].attributes.port) + "\" ";
                        break;

                    case "CAA":
                        tableHtmlRows += "<td><b>Flags: </b> " + htmlEncode(records[i].attributes.flags) +
                            "<br /><b>Tag:</b> " + htmlEncode(records[i].attributes.tag) +
                            "<br /><b>Authority:</b> " + htmlEncode(records[i].attributes.value) + "</td>";

                        additionalDataAttributes = "data-record-flags=\"" + htmlEncode(records[i].attributes.flags) + "\" " +
                            "data-record-tag=\"" + htmlEncode(records[i].attributes.tag) + "\" ";
                        break;

                    default:
                        tableHtmlRows += "<td><b>RDATA:</b> " + htmlEncode(records[i].attributes.value) + "</td>";
                        break;
                }

                tableHtmlRows += "<td align=\"right\">";
                tableHtmlRows += "<div id=\"data" + id + "\" data-record-name=\"" + htmlEncode(records[i].name) + "\" data-record-type=\"" + records[i].type + "\" data-record-ttl=\"" + records[i].ttl + "\" data-record-value=\"" + htmlEncode(records[i].attributes.value) + "\" " + additionalDataAttributes + " data-record-disabled=\"" + records[i].disabled + "\" style=\"display: none;\"></div>";
                tableHtmlRows += "<button type=\"button\" class=\"btn btn-primary\" style=\"font-size: 12px; padding: 2px 0px; width: 60px; margin: 0 6px 6px 0;\" data-id=\"" + id + "\" onclick=\"showEditRecordModal(this);\">Edit</button>";
                tableHtmlRows += "<button type=\"button\" class=\"btn btn-default\" id=\"btnEnableRecord" + id + "\" style=\"font-size: 12px; padding: 2px 0px; width: 60px; margin: 0 6px 6px 0;" + (records[i].disabled ? "" : " display: none;") + "\" data-id=\"" + id + "\" onclick=\"updateRecordState(this, false);\"" + (records[i].type.toUpperCase() === "SOA" ? " disabled" : "") + " data-loading-text=\"Enabling...\">Enable</button>";
                tableHtmlRows += "<button type=\"button\" class=\"btn btn-warning\" id=\"btnDisableRecord" + id + "\" style=\"font-size: 12px; padding: 2px 0px; width: 60px; margin: 0 6px 6px 0;" + (!records[i].disabled ? "" : " display: none;") + "\" data-id=\"" + id + "\" onclick=\"updateRecordState(this, true);\"" + (records[i].type.toUpperCase() === "SOA" ? " disabled" : "") + " data-loading-text=\"Disabling...\">Disable</button>";
                tableHtmlRows += "<button type=\"button\" class=\"btn btn-danger\" style=\"font-size: 12px; padding: 2px 0px; width: 60px; margin: 0 6px 6px 0;\" data-loading-text=\"Deleting...\" data-id=\"" + id + "\" onclick=\"deleteRecord(this);\"" + (records[i].type.toUpperCase() === "SOA" ? " disabled" : "") + ">Delete</button></td></tr>";
            }

            $("#titleEditZone").text(domain);
            $("#tableEditZoneBody").html(tableHtmlRows);

            if (records.length > 0)
                $("#tableEditZoneFooter").html("<tr><td colspan=\"5\"><b>Total Records: " + records.length + "</b></td></tr>");
            else
                $("#tableEditZoneFooter").html("<tr><td colspan=\"5\" align=\"center\">No Records Found</td></tr>");

            divViewZonesLoader.hide();
            divEditZone.show();
        },
        error: function () {
            divViewZonesLoader.hide();
            divViewZones.show();
        },
        invalidToken: function () {
            showPageLogin();
        },
        objLoaderPlaceholder: divViewZonesLoader
    });
}

function clearAddEditForm() {
    $("#divAddEditRecordAlert").html("");

    $("#optAddEditRecordType").prop("disabled", false);
    $("#txtAddEditRecordNameOrSubjectDID").prop("disabled", false);

    HideAllFormPanels();

    $("#txtAddEditRecordNameOrSubjectDID").val("");
    $("#optAddEditRecordType").val("A");
    $("#txtAddEditRecordTtl").val("");
    $("#lblAddEditRecordDataValue").text("IPv4 Address");
    $("#txtAddEditRecordDataValue").val("");
    $("#divAddEditRecordData").show();

    $("#divEditRecordDataSoa").hide();
    $("#txtEditRecordDataSoaMasterNameServer").val("");
    $("#txtEditRecordDataSoaResponsiblePerson").val("");
    $("#txtEditRecordDataSoaSerial").val("");
    $("#txtEditRecordDataSoaRefresh").val("");
    $("#txtEditRecordDataSoaRetry").val("");
    $("#txtEditRecordDataSoaExpire").val("");
    $("#txtEditRecordDataSoaMinimum").val("");

    $("#divAddEditRecordDataMx").hide();
    $("#txtAddEditRecordDataMxPreference").val("");
    $("#txtAddEditRecordDataMxExchange").val("");

    $("#divAddEditRecordDataSrv").hide();
    $("#txtAddEditRecordDataSrvPriority").val("");
    $("#txtAddEditRecordDataSrvWeight").val("");
    $("#txtAddEditRecordDataSrvPort").val("");
    $("#txtAddEditRecordDataSrvTarget").val("");

    $("#divAddEditRecordDataCaa").hide();
    $("#txtAddEditRecordDataCaaFlags").val("");
    $("#txtAddEditRecordDataCaaTag").val("");
    $("#txtAddEditRecordDataCaaValue").val("");

    $("#btnAddEditRecord").button("reset");
}

function exportZone() {
    var zoneTitle = document.getElementById("titleEditZone");
    var zoneName = zoneTitle.innerText;

    var apiUrl = "/api/exportZone?token=" + token + "&domain=" + encodeURIComponent(zoneName);

    window.open(apiUrl, "_blank");

    showAlert("success", "Exported!", "Zone was exported successfully: '" + zoneName + "'");
}

function importZone() {
    var zoneTitle = document.getElementById("titleEditZone");
    var zoneName = zoneTitle.innerText;

    var apiUrl = "/api/importZone?token=" + token + "&domain=" + encodeURIComponent(zoneName);

    window.open(apiUrl, "_blank");

    showAlert("success", "Imported!", "Zone was successfully imported: '" + zoneName + "'");
}

function showAddRecordModal() {
    clearAddEditForm();

    $("#titleAddEditRecord").text("Add Record");
    $("#optEditRecordTypeSoa").hide();
    $("#btnAddEditRecord").attr("onclick", "addRecord(); return false;");

    $("#modalAddEditRecord").modal("show");
}

function HideAllFormPanels() {
    $("#lblAddEditRecordNameOrSubjectDID").text("Name");
    $("#divAddEditRecordNameOrSubjectDID").show();

    $("#divAddEditRecordDID").hide();
    $("#divAddEditRecordType").hide();

    $("#divAddEditRecordTag").hide();

    $("#divAddEditRecordDescription").hide();
    $("#divAddEditRecordData").hide();
    $("#divAddEditRecordParms").hide();

    $("#divEditRecordDataSoa").hide();
    $("#divAddEditRecordDataMx").hide();
    $("#divAddEditRecordDataSrv").hide();
    $("#divAddEditRecordDataCaa").hide();

    $("#divAddEditRecordPublicKey").hide();
    $("#divAddEditRecordControllerDID").hide();
}

function modifyAddRecordForm() {
    $("#divAddEditRecordAlert").html("");

    $("#txtAddEditRecordNameOrSubjectDID").prop("placeholder", "@");

    var type = $("#optAddEditRecordType").val();

    HideAllFormPanels();

    switch (type) {
        case "A":
            $("#lblAddEditRecordNameOrSubjectDID").text("Name");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordDataValue").text("IPv4 Address");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "NS":
            $("#lblAddEditRecordNameOrSubjectDID").text("Name");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordDataValue").text("Domain Name");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "SOA":
            $("#lblAddEditRecordNameOrSubjectDID").text("Name");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#txtEditRecordDataSoaMasterNameServer").val("");
            $("#txtEditRecordDataSoaResponsiblePerson").val("");
            $("#txtEditRecordDataSoaSerial").val("");
            $("#txtEditRecordDataSoaRefresh").val("");
            $("#txtEditRecordDataSoaRetry").val("");
            $("#txtEditRecordDataSoaExpire").val("");
            $("#txtEditRecordDataSoaMinimum").val("");
            $("#divEditRecordDataSoa").show();
            break;

        case "CNAME":
            $("#lblAddEditRecordNameOrSubjectDID").text("Name");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordDataValue").text("Domain Name");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "PTR":
            $("#lblAddEditRecordNameOrSubjectDID").text("Name");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordDataValue").text("Domain Name");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "MX":
            $("#lblAddEditRecordNameOrSubjectDID").text("Name");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#txtAddEditRecordDataMxPreference").val("");
            $("#txtAddEditRecordDataMxExchange").val("");
            $("#divAddEditRecordDataMx").show();
            break;

        case "TXT":
            $("#lblAddEditRecordNameOrSubjectDID").text("Name");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordDataValue").text("Text Data");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "DIDID": // mwh - 3 fields: Name, Type, and TTL
            $("#lblAddEditRecordNameOrSubjectDID").text("Subject DID");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordDataValue").text("Value");
            $("#txtAddEditRecordDataValue").val("AddRecord() will override this with the domain label value");
            break;

        case "DIDCTX": // mwh - 4 fields: Name, Type, TTL, and @context URI string
            $("#lblAddEditRecordNameOrSubjectDID").text("Subject DID*");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordTagValue").text("Tag");
            $("#txtAddEditRecordTagValue").val("");
            $("#divAddEditRecordTag").show();
            $("#lblAddEditRecordDataValue").text("Context URI*");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "DIDTXT": // mwh
            $("#lblAddEditRecordNameOrSubjectDID").text("Subject DID*");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordTagValue").text("Tag");
            $("#txtAddEditRecordTagValue").val("");
            $("#divAddEditRecordTag").show();
            $("#lblAddEditRecordDIDValue").text("Text DID");
            $("#txtAddEditRecordDIDValue").val("");
            $("#divAddEditRecordDID").show();
            $("#lblAddEditRecordDataValue").text("Text Data*");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "DIDSUBSIG": // mwh
            $("#lblAddEditRecordNameOrSubjectDID").text("Subject DID*");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordTagValue").text("Tag");
            $("#txtAddEditRecordTagValue").val("");
            $("#divAddEditRecordTag").show();
            $("#lblAddEditRecordDIDValue").text("Subject Signature DID");
            $("#txtAddEditRecordDIDValue").val("");
            $("#divAddEditRecordDID").show();
            $("#lblAddEditRecordDataValue").text("Subject Signature Data*");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "DIDSVC": // mwh
            $("#lblAddEditRecordNameOrSubjectDID").text("Subject DID*");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordTagValue").text("Tag");
            $("#txtAddEditRecordTagValue").val("");
            $("#divAddEditRecordTag").show();
            $("#lblAddEditRecordDIDValue").text("Service Endpoint DID");
            $("#txtAddEditRecordDIDValue").val("");
            $("#divAddEditRecordDID").show();
            $("#lblAddEditRecordTypeValue").text("Type");
            $("#txtAddEditRecordTypeValue").val("");
            $("#divAddEditRecordType").show();
            $("#lblAddEditRecordDescriptionValue").text("Description");
            $("#txtAddEditRecordDescriptionValue").val("");
            $("#divAddEditRecordDescription").show();
            $("#lblAddEditRecordDataValue").text("Service Endpoint URL*");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;
    
        case "DIDATHN": // mwh
            $("#lblAddEditRecordNameOrSubjectDID").text("Subject DID*");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordTagValue").text("Tag");
            $("#txtAddEditRecordTagValue").val("");
            $("#divAddEditRecordTag").show();
            $("#lblAddEditRecordDIDValue").text("Authentication Public Key DID");
            $("#txtAddEditRecordDIDValue").val("");
            $("#divAddEditRecordDID").show();
            $("#lblAddEditRecordTypeValue").text("Type");
            $("#txtAddEditRecordTypeValue").val("");
            $("#divAddEditRecordType").show();
            $("#lblAddEditRecordPublicKeyValue").text("Public Key (Base58)*");
            $("#txtAddEditRecordPublicKeyValue").val("");
            $("#divAddEditRecordPublicKey").show();
            $("#lblAddEditRecordControllerDIDValue").text("Controller DID");
            $("#txtAddEditRecordControllerDIDValue").val("");
            $("#divAddEditRecordControllerDID").show();
            break;

        case "DIDPUBK": // mwh
            $("#lblAddEditRecordNameOrSubjectDID").text("Subject DID*");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordTagValue").text("Tag");
            $("#txtAddEditRecordTagValue").val("");
            $("#divAddEditRecordTag").show();
            $("#lblAddEditRecordDIDValue").text("Subject Public Key DID");
            $("#txtAddEditRecordDIDValue").val("");
            $("#divAddEditRecordDID").show();
            $("#lblAddEditRecordTypeValue").text("Type");
            $("#txtAddEditRecordTypeValue").val("");
            $("#divAddEditRecordType").show();
            $("#lblAddEditRecordPublicKeyValue").text("Pubic Key*");
            $("#txtAddEditRecordPublicKeyValue").val("");
            $("#divAddEditRecordPublicKey").show();
            $("#lblAddEditRecordControllerDIDValue").text("Controller DID");
            $("#txtAddEditRecordControllerDIDValue").val("");
            $("#divAddEditRecordControllerDID").show();
            break;

        case "DIDEXTDAT":
            $("#lblAddEditRecordNameOrSubjectDID").text("Subject DID*");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordTagValue").text("Tag*");
            $("#txtAddEditRecordTagValue").val("");
            $("#divAddEditRecordTag").show();
            $("#lblAddEditRecordDIDValue").text("External Data DID");
            $("#txtAddEditRecordDIDValue").val("");
            $("#divAddEditRecordDID").show();
            $("#lblAddEditRecordTypeValue").text("Data Source Type");
            $("#txtAddEditRecordTypeValue").val("");
            $("#divAddEditRecordType").show();
            $("#lblAddEditRecordDataValue").text("Data Source*");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            $("#lblAddEditRecordDescriptionValue").text("Query");
            $("#txtAddEditRecordDescriptionValue").val("");
            $("#divAddEditRecordDescription").show();
            $("#lblAddEditRecordParmsValue").text("Parameters");
            $("#txtAddEditRecordParmsValue").val("");
            $("#divAddEditRecordParms").show();
            break;

        case "UUBLAddress":
            $("#lblAddEditRecordNameOrSubjectDID").text("Address DID");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordTagValue").text("Tag");
            $("#txtAddEditRecordTagValue").val("");
            $("#divAddEditRecordTag").show();
            $("#lblAddEditRecordDataValue").text("Value");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "AAAA":
            $("#lblAddEditRecordNameOrSubjectDID").text("Name");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordDataValue").text("IPv6 Address");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "SRV":
            $("#lblAddEditRecordNameOrSubjectDID").text("Name");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordNameOrSubjectDID").prop("placeholder", "_service._protocol.name");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#txtAddEditRecordDataSrvPriority").val("");
            $("#txtAddEditRecordDataSrvWeight").val("");
            $("#txtAddEditRecordDataSrvPort").val("");
            $("#txtAddEditRecordDataSrvTarget").val("");
            $("#divAddEditRecordDataSrv").show();
            break;

        case "CAA":
            $("#lblAddEditRecordNameOrSubjectDID").text("Name");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#txtAddEditRecordDataCaaFlags").val("");
            $("#txtAddEditRecordDataCaaTag").val("");
            $("#txtAddEditRecordDataCaaValue").val("");
            $("#divAddEditRecordDataCaa").show();
            break;
    }
}

function addRecord() {
    var btn = $("#btnAddEditRecord");
    var divAddEditRecordAlert = $("#divAddEditRecordAlert");

    var domain;
    {
        var subDomain = $("#txtAddEditRecordNameOrSubjectDID").val();
        if (subDomain === "")
            subDomain = "@";

        var zone = $("#titleEditZone").text();

        if (subDomain === "@")
            domain = zone;
        else if (zone === ".")
            domain = subDomain + ".";
        else
            domain = subDomain + "." + zone;
    }

    var type = $("#optAddEditRecordType").val();

    var ttl = $("#txtAddEditRecordTtl").val();
    if (ttl === "")
        ttl = 3600;

    var apiUrl = "/api/addRecord?token=" + token + "&domain=" + encodeURIComponent(domain) + "&type=" + type + "&ttl=" + ttl;
    ///api/addRecord?token=2ad70970fa36a3469fc3e19f1ee438c1d6c6b8b9272f700d25eb74d9acd12686&domain=06AE4B28-1C2D-4783-96A5-2E35A196004B.neonation.did&type=DIDSVC&ttl=3600

    switch (type) {
        case "A":
        case "NS":
        case "PTR":
        case "TXT":
        case "AAAA":
            var value = $("#txtAddEditRecordDataValue").val();
            if (value === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&value=" + encodeURIComponent(value);
            break;

        case "DIDID": // mwh
            var value = $("#txtAddEditRecordDataValue").val();
            if (value === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&value=" + encodeURIComponent(value);
            break;

        case "DIDTXT": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var tag = $("#txtAddEditRecordTagValue").val();
            //if (did === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Tag.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTagValue").focus();
            //    return;
            //}

            var did = $("#txtAddEditRecordDIDValue").val();
            //if (did === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Text DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDIDValue").focus();
            //    return;
            //}

            var textData = $("#txtAddEditRecordDataValue").val();
            if (textData === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the Text Data field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&didTag=" + tag + "&didDID=" + encodeURIComponent(did) + "&value=" + encodeURIComponent(textData) + "&didTrace=" + "zone.js:addRecord";
            break;

        case "DIDCTX": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var tag = $("#txtAddEditRecordTagValue").val();
            //if (did === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Tag.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTagValue").focus();
            //    return;
            //}

            var textData = $("#txtAddEditRecordDataValue").val();
            if (textData === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the Context URI field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&didTag=" + tag + "&value=" + encodeURIComponent(textData) + "&didTrace=" + "zone.js:addRecord";
            break;

        case "DIDSUBSIG": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var tag = $("#txtAddEditRecordTagValue").val();
            //if (did === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Tag.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTagValue").focus();
            //    return;
            //}

            var did = $("#txtAddEditRecordDIDValue").val();
            //if (did === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Text DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDIDValue").focus();
            //    return;
            //}

            var sigData = $("#txtAddEditRecordDataValue").val();
            if (sigData === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the Signature Data field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&didTag=" + tag + "&didDID=" + encodeURIComponent(did) + "&value=" + encodeURIComponent(sigData) + "&didTrace=" + "zone.js:addRecord";
            break;

        case "DIDSVC": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var tag = $("#txtAddEditRecordTagValue").val();
            //if (did === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Tag.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTagValue").focus();
            //    return;
            //}

            var did = $("#txtAddEditRecordDIDValue").val();
            //if (did === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable SVC DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDIDValue").focus();
            //    return;
            //}

            var type = $("#txtAddEditRecordTypeValue").val();
            //if (type === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Type.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTypeValue").focus();
            //    return;
            //}

            var description = $("#txtAddEditRecordDescriptionValue").val();
            //if (description === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Description.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDescriptionValue").focus();
            //    return;
            //}

            var serviceEndpointUrl = $("#txtAddEditRecordDataValue").val();
            if (serviceEndpointUrl === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the Service Endpoint Url field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&didTag=" + tag + "&didDID=" + encodeURIComponent(did) + "&didType=" + encodeURIComponent(type) + "&didDescription=" + encodeURIComponent(description) + "&value=" + encodeURIComponent(serviceEndpointUrl) + "&didTrace=" + "zone.js:addRecord";
            break;

        case "DIDPUBK": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var tag = $("#txtAddEditRecordTagValue").val();
            //if (did === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Tag.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTagValue").focus();
            //    return;
            //}

            var did = $("#txtAddEditRecordDIDValue").val();
            //if (did === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Public Key DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDIDValue").focus();
            //    return;
            //}

            var type = $("#txtAddEditRecordTypeValue").val();
            //if (type === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Type.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTypeValue").focus();
            //    return;
            //}

            var controller = $("#txtAddEditRecordControllerDIDValue").val();
            //if (controller === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Controller DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordControllerDIDValue").focus();
            //    return;
            //}

            var publicKey = $("#txtAddEditRecordPublicKeyValue").val();
            if (publicKey === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the Public Key field.", divAddEditRecordAlert);
                $("#txtAddEditRecordPublicKeyValue").focus();
                return;
            }

            apiUrl += "&didTag=" + tag + "&didDID=" + encodeURIComponent(did) + "&didType=" + type + "&didControllerDID=" + controller + "&value=" + encodeURIComponent(publicKey) + "&didTrace=" + "zone.js:addRecord";
            break;

        case "DIDATHN": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var tag = $("#txtAddEditRecordTagValue").val();
            //if (tag === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Tag.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTagValue").focus();
            //    return;
            //}

            var did = $("#txtAddEditRecordDIDValue").val();
            //if (did === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Authentication Pubic Key DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDIDValue").focus();
            //    return;
            //}

            var type = $("#txtAddEditRecordTypeValue").val();
            //if (type === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Type.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTypeValue").focus();
            //    return;
            //}

            var controller = $("#txtAddEditRecordControllerDIDValue").val();
            //if (controller === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Controller DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordControllerDIDValue").focus();
            //    return;
            //}

            var publicKey = $("#txtAddEditRecordPublicKeyValue").val();
            if (publicKey === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the Authentication Public Key field.", divAddEditRecordAlert);
                $("#txtAddEditRecordPublicKeyValue").focus();
                return;
            }

            apiUrl += "&didTag=" + tag + "&didDID=" + encodeURIComponent(did) + "&didType=" + type + "&didControllerDID=" + controller + "&value=" + encodeURIComponent(publicKey) + "&didTrace=" + "zone.js:addRecord";
            break;

        case "DIDEXTDAT": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var tag = $("#txtAddEditRecordTagValue").val();
            if (tag === "") {
                showAlert("warning", "Missing!", "Please enter a suitable Tag.", divAddEditRecordAlert);
                $("#txtAddEditRecordTagValue").focus();
                return;
            }
            console.log("tag:'" + tag + "'");

            var did = $("#txtAddEditRecordDIDValue").val();
            //if (did === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Authentication Pubic Key DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDIDValue").focus();
            //    return;
            //}
            console.log("did:'" + did + "'");

            var type = $("#txtAddEditRecordTypeValue").val();
            //if (type === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Type.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTypeValue").focus();
            //    return;
            //}
            console.log("type:'" + type + "'");

            var source = $("#txtAddEditRecordDataValue").val();
            if (source === "") {
                showAlert("warning", "Missing!", "Please enter a suitable Data Source.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }
            console.log("source:'" + source + "'");

            var query = $("#txtAddEditRecordDescriptionValue").val();
            //if (query === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable value into the Query field.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDescriptionValue").focus();
            //    return;
            //}
            console.log("query:'" + query + "'");

            var parms = $("#txtAddEditRecordParmsValue").val();
            //if (parms === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable value into the Parameters field.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordParmsValue").focus();
            //    return;
            //}
            console.log("parms:'" + parms + "'");

            apiUrl +=
                "&didTag=" + tag + "&didDID=" + encodeURIComponent(did) + "&didType=" + type +
                "&value=" + encodeURIComponent(source) + "&didQuery=" + encodeURIComponent(query) +
                "&didParms=" + encodeURIComponent(parms) + "&didTrace=" + "zone.js:addRecord.1140";
            console.log("apiUrl:'" + apiUrl + "'");
            break;

        case "UUBLAddress":
            var value = $("#txtAddEditRecordDataValue").val();
            if (value === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&value=" + encodeURIComponent(value);
            break;

        case "CNAME":
            var subDomainName = $("#txtAddEditRecordNameOrSubjectDID").val();
            if ((subDomainName === "") || (subDomainName === "@")) {
                showAlert("warning", "Missing!", "Please enter a name for the CNAME record.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var value = $("#txtAddEditRecordDataValue").val();
            if (value === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&value=" + encodeURIComponent(value);
            break;

        case "MX":
            var preference = $("#txtAddEditRecordDataMxPreference").val();
            if (preference === "")
                preference = 1;

            var value = $("#txtAddEditRecordDataMxExchange").val();
            if (value === "") {
                showAlert("warning", "Missing!", "Please enter an mail exchange domain name into the exchange field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataMxExchange").focus();
                return;
            }

            apiUrl += "&preference=" + preference + "&value=" + encodeURIComponent(value);
            break;

        case "SRV":
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a name that includes service and protocol labels.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var priority = $("#txtAddEditRecordDataSrvPriority").val();
            if (priority === "") {
                showAlert("warning", "Missing!", "Please enter a suitable priority.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvPriority").focus();
                return;
            }

            var weight = $("#txtAddEditRecordDataSrvWeight").val();
            if (weight === "") {
                showAlert("warning", "Missing!", "Please enter a suitable weight.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvWeight").focus();
                return;
            }

            var port = $("#txtAddEditRecordDataSrvPort").val();
            if (port === "") {
                showAlert("warning", "Missing!", "Please enter a suitable port number.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvPort").focus();
                return;
            }

            var value = $("#txtAddEditRecordDataSrvTarget").val();
            if (value === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the target field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvTarget").focus();
                return;
            }

            apiUrl += "&priority=" + priority + "&weight=" + weight + "&port=" + port + "&value=" + encodeURIComponent(value);
            break;

        case "CAA":
            var flags = $("#txtAddEditRecordDataCaaFlags").val();
            if (flags === "")
                flags = 0;

            var tag = $("#txtAddEditRecordDataCaaTag").val();
            if (tag === "")
                tag = "issue";

            var value = $("#txtAddEditRecordDataCaaValue").val();
            if (value === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the authority field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataCaaValue").focus();
                return;
            }

            apiUrl += "&flags=" + flags + "&tag=" + encodeURIComponent(tag) + "&value=" + encodeURIComponent(value);
            break;
    }

    btn.button("loading");

    HTTPRequest({
        url: apiUrl,
        success: function (responseJSON) {
            $("#modalAddEditRecord").modal("hide");
            showEditZone(zone);
            showAlert("success", "Record Added!", "Resource record was added successfully.");
        },
        error: function () {
            btn.button('reset');
        },
        invalidToken: function () {
            showPageLogin();
        },
        objAlertPlaceholder: divAddEditRecordAlert
    });
}

function showEditRecordModal(objBtn) {
    var btn = $(objBtn);
    var id = btn.attr("data-id");
    var divData = $("#data" + id);

    var zone = $("#titleEditZone").text();
    var name = divData.attr("data-record-name");
    var type = divData.attr("data-record-type");
    var ttl = divData.attr("data-record-ttl");

    if (name === zone)
        name = "@";
    else
        name = name.replace("." + zone, "");

    clearAddEditForm();
    $("#titleAddEditRecord").text("Edit Record");
    $("#optEditRecordTypeSoa").show();
    $("#optAddEditRecordType").val(type);
    modifyAddRecordForm();

    $("#txtAddEditRecordNameOrSubjectDID").val(name);
    $("#txtAddEditRecordTtl").val(ttl)

    switch (type) {
        case "A":
        case "NS":
        case "CNAME":
        case "PTR":
        case "TXT":
        case "AAAA":
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-value"));
            break;

        case "DIDID": // mwh
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-value"));
            break;

        case "DIDTXT": // mwh 
            $("#txtAddEditRecordTagValue").val(divData.attr("data-record-didTag"));
            $("#txtAddEditRecordDIDValue").val(divData.attr("data-record-didDID"));
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-value"));
            break;

        case "DIDCTX": // mwh 
            $("#txtAddEditRecordTagValue").val(divData.attr("data-record-didTag"));
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-value"));
            break;

        case "DIDSUBSIG": // mwh 
            $("#txtAddEditRecordTagValue").val(divData.attr("data-record-didTag"));
            $("#txtAddEditRecordDIDValue").val(divData.attr("data-record-didDID"));
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-value"));
            break;

        case "DIDSVC": // mwh 
            $("#txtAddEditRecordTagValue").val(divData.attr("data-record-didTag"));
            $("#txtAddEditRecordDIDValue").val(divData.attr("data-record-didDID"));
            $("#txtAddEditRecordTypeValue").val(divData.attr("data-record-didType"));
            $("#txtAddEditRecordDescriptionValue").val(divData.attr("data-record-didDescription"));
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-value"));
            break;

        case "DIDPUBK": // mwh
            $("#txtAddEditRecordTagValue").val(divData.attr("data-record-didTag"));
            $("#txtAddEditRecordDIDValue").val(divData.attr("data-record-didDID"));
            $("#txtAddEditRecordTypeValue").val(divData.attr("data-record-didType"));
            $("#txtAddEditRecordPublicKeyValue").val(divData.attr("data-record-value"));
            $("#txtAddEditRecordControllerDIDValue").val(divData.attr("data-record-didControllerDID"));
            break;

        case "DIDATHN": // mwh
            $("#txtAddEditRecordTagValue").val(divData.attr("data-record-didTag"));
            $("#txtAddEditRecordDIDValue").val(divData.attr("data-record-didDID"));
            $("#txtAddEditRecordTypeValue").val(divData.attr("data-record-didType"));
            $("#txtAddEditRecordPublicKeyValue").val(divData.attr("data-record-value"));
            $("#txtAddEditRecordControllerDIDValue").val(divData.attr("data-record-didControllerDID"));
            break;

        case "DIDEXTDAT": // mwh
            $("#txtAddEditRecordTagValue").val(divData.attr("data-record-didTag"));
            $("#txtAddEditRecordDIDValue").val(divData.attr("data-record-didDID"));
            $("#txtAddEditRecordTypeValue").val(divData.attr("data-record-didType"));
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-value")); // Source
            $("#txtAddEditRecordQueryValue").val(divData.attr("data-record-didQuery"));
            $("#txtAddEditRecordParmsValue").val(divData.attr("data-record-didParms"));
            break;

        case "UUBLAddress":
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-value"));
            break;

        case "SOA":
            $("#txtEditRecordDataSoaMasterNameServer").val(divData.attr("data-record-mname"));
            $("#txtEditRecordDataSoaResponsiblePerson").val(divData.attr("data-record-rperson"));
            $("#txtEditRecordDataSoaSerial").val(divData.attr("data-record-serial"));
            $("#txtEditRecordDataSoaRefresh").val(divData.attr("data-record-refresh"));
            $("#txtEditRecordDataSoaRetry").val(divData.attr("data-record-retry"));
            $("#txtEditRecordDataSoaExpire").val(divData.attr("data-record-expire"));
            $("#txtEditRecordDataSoaMinimum").val(divData.attr("data-record-minimum"));
            break;

        case "MX":
            $("#txtAddEditRecordDataMxPreference").val(divData.attr("data-record-preference"));
            $("#txtAddEditRecordDataMxExchange").val(divData.attr("data-record-value"));
            break;

        case "SRV":
            $("#txtAddEditRecordDataSrvPriority").val(divData.attr("data-record-priority"));
            $("#txtAddEditRecordDataSrvWeight").val(divData.attr("data-record-weight"));
            $("#txtAddEditRecordDataSrvPort").val(divData.attr("data-record-port"));
            $("#txtAddEditRecordDataSrvTarget").val(divData.attr("data-record-value"));
            break;

        case "CAA":
            $("#txtAddEditRecordDataCaaFlags").val(divData.attr("data-record-flags"));
            $("#txtAddEditRecordDataCaaTag").val(divData.attr("data-record-tag"));
            $("#txtAddEditRecordDataCaaValue").val(divData.attr("data-record-value"));
            break;

        default:
            showAlert("warning", "Not Supported!", "Record type not supported for edit.");
            return;
    }

    $("#txtAddEditRecordNameOrSubjectDID").prop("disabled", (type === "SOA"));
    $("#optAddEditRecordType").prop("disabled", true);

    $("#btnAddEditRecord").attr("data-id", id);
    $("#btnAddEditRecord").attr("onclick", "updateRecord(); return false;");

    $("#modalAddEditRecord").modal("show");
}

function updateRecord() {
    var btn = $("#btnAddEditRecord");
    var divAddEditRecordAlert = $("#divAddEditRecordAlert");

    var id = btn.attr("data-id");
    var divData = $("#data" + id);

    var zone = $("#titleEditZone").text();
    var type = divData.attr("data-record-type");
    var domain = divData.attr("data-record-name");

    if (domain === "")
        domain = ".";

    var newDomain;
    {
        var newSubDomain = $("#txtAddEditRecordNameOrSubjectDID").val();
        if (newSubDomain === "")
            newSubDomain = "@";

        if (newSubDomain === "@")
            newDomain = zone;
        else if (zone === ".")
            newDomain = newSubDomain + ".";
        else
            newDomain = newSubDomain + "." + zone;
    }

    var ttl = $("#txtAddEditRecordTtl").val();
    if (ttl === "")
        ttl = 3600;

    var value = divData.attr("data-record-value");
    var disable = (divData.attr("data-record-disabled") === "true");

    var apiUrl = "/api/updateRecord?token=" + token + "&type=" + type + "&domain=" + encodeURIComponent(domain) + "&newDomain=" + encodeURIComponent(newDomain) + "&ttl=" + ttl + "&value=" + encodeURIComponent(value) + "&disable=" + disable;

    switch (type) {
        case "A":
        case "NS":
        case "PTR":
        case "TXT":
        case "AAAA":
            var newValue = $("#txtAddEditRecordDataValue").val();
            if (newValue === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&newValue=" + encodeURIComponent(newValue);
            break;

        case "DIDID": // mwh
            var newValue = $("#txtAddEditRecordDataValue").val();
            if (newValue === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&newValue=" + encodeURIComponent(newValue);
            break;

        case "DIDTXT": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var oldTag = divData.attr("data-record-didTag");
            var oldDID = divData.attr("data-record-didDID");
            var oldTextData = divData.attr("data-record-value");

            var newTag = $("#txtAddEditRecordTagValue").val();
            //if (newTag === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Tag.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTagValue").focus();
            //    return;
            //}

            var newDID = $("#txtAddEditRecordDIDValue").val();
            //if (newDID === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Service Endpoint DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDIDValue").focus();
            //    return;
            //}

            var newTextData = $("#txtAddEditRecordDataValue").val();
            if (newTextData === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the Text Data field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&oldTag=" + oldTag + "&oldDID=" + encodeURIComponent(oldDID) + "&oldValue=" + encodeURIComponent(oldTextData)
                + "&newTag=" + newTag + "&newDID=" + encodeURIComponent(newDID) + "&newValue=" + encodeURIComponent(newTextData)
                + "&didTrace=" + "zone.js:updateRecord";
            break;

        case "DIDCTX": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var oldTag = divData.attr("data-record-didTag");
            var oldTextData = divData.attr("data-record-value");

            var newTag = $("#txtAddEditRecordTagValue").val();
            //if (newTag === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Tag.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTagValue").focus();
            //    return;
            //}

            var newTextData = $("#txtAddEditRecordDataValue").val();
            if (newTextData === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the Text Data field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&oldTag=" + oldTag + "&oldValue=" + encodeURIComponent(oldTextData)
                + "&newTag=" + newTag + "&newValue=" + encodeURIComponent(newTextData)
                + "&didTrace=" + "zone.js:updateRecord";
            break;

        case "DIDSUBSIG": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var oldTag = divData.attr("data-record-didTag");
            var oldDID = divData.attr("data-record-didDID");
            var oldSigData = divData.attr("data-record-value");

            var newTag = $("#txtAddEditRecordTagValue").val();
            //if (newTag === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Tag.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTagValue").focus();
            //    return;
            //}

            var newDID = $("#txtAddEditRecordDIDValue").val();
            //if (newDID === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Service Endpoint DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDIDValue").focus();
            //    return;
            //}

            var newSigData = $("#txtAddEditRecordDataValue").val();
            if (newSigData === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the Signature Data field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl +=  
                  "&oldTag=" + oldTag + "&oldDID=" + encodeURIComponent(oldDID)
            + "&oldValue=" + encodeURIComponent(oldSigData)
            //+ "&newTag2=" + newTag + "&newDID2=\"" + newDID + "\""
                + "&newTag=" + newTag + "&newDID=\"" + encodeURIComponent(newDID) + "\""
                + "&newValue=" + encodeURIComponent(newSigData)
                + "&didTrace=" + "zone.js:updateRecord.1491";
            break;

        case "DIDSVC": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var oldTag = divData.attr("data-record-didTag");
            var oldDID = divData.attr("data-record-didDID");
            var oldType = divData.attr("data-record-didType");
            var oldDescription = divData.attr("data-record-didDesription");
            var oldServiceEndpointUrl = divData.attr("data-record-value");

            var newTag = $("#txtAddEditRecordTagValue").val();
            //if (newTag === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Tag.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTagValue").focus();
            //    return;
            //}

            var newDID = $("#txtAddEditRecordDIDValue").val();
            //if (newDID === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Service Endpoint DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDIDValue").focus();
            //    return;
            //}

            var newType = $("#txtAddEditRecordTypeValue").val();
            //if (newType === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Type.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTypeValue").focus();
            //    return;
            //}

            var newDescription = $("#txtAddEditRecordDescriptionValue").val();
            //if (newDescription === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Description.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDescriptionValue").focus();
            //    return;
            //}

            var newServiceEndpointUrl = $("#txtAddEditRecordDataValue").val();
            if (newServiceEndpointUrl === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the Service Endpoint URL field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&oldTag=" + oldTag + "&oldDID=" + encodeURIComponent(oldDID) + "&oldType=" + oldType + "&oldDescription=" + encodeURIComponent(oldDescription) + "&oldValue=" + encodeURIComponent(oldServiceEndpointUrl)
                + "&newTag=" + newTag + "&newDID=" + encodeURIComponent(newDID) + "&newType=" + newType + "&newDescription=" + encodeURIComponent(newDescription) + "&newValue=" + encodeURIComponent(newServiceEndpointUrl)
                    + "&didTrace=" + "zone.js:updateRecord";
            break;

        case "DIDPUBK": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var oldTag = divData.attr("data-record-didTag");
            var oldDID = divData.attr("data-record-didDID");
            var oldType = divData.attr("data-record-didType");
            var oldControllerDID = divData.attr("data-record-didControllerDID");
            var oldValue = divData.attr("data-record-value");

            var newTag = $("#txtAddEditRecordTagValue").val();
            //if (newTag === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Tag.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTagValue").focus();
            //    return;
            //}

            var newDID = $("#txtAddEditRecordDIDValue").val();
            //if (newDID === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Subject Public Key DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDIDValue").focus();
            //    return;
            //}

            var newType = $("#txtAddEditRecordTypeValue").val();
            //if (newType === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Type.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTypeValue").focus();
            //    return;
            //}

            var newControllerDID = $("#txtAddEditRecordControllerDIDValue").val();
            //if (newControllerDID === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Controller DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordControllerDIDValue").focus();
            //    return;
            //}

            var newValue = $("#txtAddEditRecordPublicKeyValue").val();
            //if (newValue === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable value into the Subject Public Key field.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordPublicKeyValue").focus();
            //    return;
            //}

            apiUrl += "&oldTag=" + oldTag + "&oldDID=" + encodeURIComponent(oldDID) + "&oldType=" + oldType + "&oldControllerDID=" + encodeURIComponent(oldControllerDID) + "&oldValue=" + encodeURIComponent(oldValue)
                + "&newTag=" + newTag + "&newDID=" + encodeURIComponent(newDID) + "&newType=" + newType + "&newControllerDID=" + encodeURIComponent(newControllerDID) + "&newValue=" + encodeURIComponent(newValue)
                + "&didTrace=" + "zone.js:updateRecord";
            break;

        case "DIDATHN": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var oldTag = divData.attr("data-record-didTag");
            var oldDID = divData.attr("data-record-didDID");
            var oldType = divData.attr("data-record-didType");
            var oldControllerDID = divData.attr("data-record-didControllerDID");
            var oldValue = divData.attr("data-record-value");

            var newTag = $("#txtAddEditRecordTagValue").val();
            //if (newTag === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Tag.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDIDValue").focus();
            //    return;
            //}

            var newDID = $("#txtAddEditRecordDIDValue").val();
            //if (newDID === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Authentication Public Key DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordDIDValue").focus();
            //    return;
            //}

            var newType = $("#txtAddEditRecordTypeValue").val();
            //if (newType === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Type.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordTypeValue").focus();
            //    return;
            //}

            var newControllerDID = $("#txtAddEditRecordControllerDIDValue").val();
            //if (newControllerDID === "") {
            //    showAlert("warning", "Missing!", "Please enter a suitable Controller DID.", divAddEditRecordAlert);
            //    $("#txtAddEditRecordControllerDIDValue").focus();
            //    return;
            //}

            var newValue = $("#txtAddEditRecordPublicKeyValue").val();
            if (newValue === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the Authentication Public Key field.", divAddEditRecordAlert);
                $("#txtAddEditRecordPublicKeyValue").focus();
                return;
            }

            apiUrl += "&oldTag=" + oldTag + "&oldDID=" + encodeURIComponent(oldDID) + "&oldType=" + oldType + "&oldControllerDID=" + encodeURIComponent(oldControllerDID) + "&oldValue=" + encodeURIComponent(oldValue)
                + "&newTag=" + newTag + "&newDID=" + encodeURIComponent(newDID) + "&newType=" + newType + "&newControllerDID=" + encodeURIComponent(newControllerDID) + "&newValue=" + encodeURIComponent(newValue)
                + "&didTrace=" + "zone.js:updateRecord";
            break;

        case "UUBLAddress":
            var newValue = $("#txtAddEditRecordDataValue").val();
            if (newValue === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&newValue=" + encodeURIComponent(newValue);
            break;


        case "CNAME":
            var subDomainName = $("#txtAddEditRecordNameOrSubjectDID").val();
            if ((subDomainName === "") || (subDomainName === "@")) {
                showAlert("warning", "Missing!", "Please enter a name for the CNAME record.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var newValue = $("#txtAddEditRecordDataValue").val();
            if (newValue === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&newValue=" + encodeURIComponent(newValue);
            break;

        case "SOA":
            var masterNameServer = $("#txtEditRecordDataSoaMasterNameServer").val();
            if (masterNameServer === "") {
                showAlert("warning", "Missing!", "Please enter a value for master name server.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaMasterNameServer").focus();
                return;
            }

            var responsiblePerson = $("#txtEditRecordDataSoaResponsiblePerson").val();
            if (responsiblePerson === "") {
                showAlert("warning", "Missing!", "Please enter a value for responsible person.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaResponsiblePerson").focus();
                return;
            }

            var serial = $("#txtEditRecordDataSoaSerial").val();
            if (serial === "") {
                showAlert("warning", "Missing!", "Please enter a value for serial.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaSerial").focus();
                return;
            }

            var refresh = $("#txtEditRecordDataSoaRefresh").val();
            if (refresh === "") {
                showAlert("warning", "Missing!", "Please enter a value for refresh.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaRefresh").focus();
                return;
            }

            var retry = $("#txtEditRecordDataSoaRetry").val();
            if (retry === "") {
                showAlert("warning", "Missing!", "Please enter a value for retry.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaRetry").focus();
                return;
            }

            var expire = $("#txtEditRecordDataSoaExpire").val();
            if (expire === "") {
                showAlert("warning", "Missing!", "Please enter a value for expire.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaExpire").focus();
                return;
            }

            var minimum = $("#txtEditRecordDataSoaMinimum").val();
            if (minimum === "") {
                showAlert("warning", "Missing!", "Please enter a value for minimum.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaMinimum").focus();
                return;
            }

            apiUrl += "&masterNameServer=" + encodeURIComponent(masterNameServer) +
                "&responsiblePerson=" + encodeURIComponent(responsiblePerson) +
                "&serial=" + encodeURIComponent(serial) +
                "&refresh=" + encodeURIComponent(refresh) +
                "&retry=" + encodeURIComponent(retry) +
                "&expire=" + encodeURIComponent(expire) +
                "&minimum=" + encodeURIComponent(minimum);
            break;

        case "MX":
            var preference = $("#txtAddEditRecordDataMxPreference").val();
            if (preference === "")
                preference = 1;

            var newValue = $("#txtAddEditRecordDataMxExchange").val();
            if (newValue === "") {
                showAlert("warning", "Missing!", "Please enter an mail exchange domain name into the exchange field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataMxExchange").focus();
                return;
            }

            apiUrl += "&preference=" + preference + "&newValue=" + encodeURIComponent(newValue);
            break;

        case "SRV":
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a name that includes service and protocol labels.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var port = divData.attr("data-record-port");

            var priority = $("#txtAddEditRecordDataSrvPriority").val();
            if (priority === "") {
                showAlert("warning", "Missing!", "Please enter a suitable priority.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvPriority").focus();
                return;
            }

            var weight = $("#txtAddEditRecordDataSrvWeight").val();
            if (weight === "") {
                showAlert("warning", "Missing!", "Please enter a suitable weight.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvWeight").focus();
                return;
            }

            var newPort = $("#txtAddEditRecordDataSrvPort").val();
            if (newPort === "") {
                showAlert("warning", "Missing!", "Please enter a suitable port number.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvPort").focus();
                return;
            }

            var newValue = $("#txtAddEditRecordDataSrvTarget").val();
            if (newValue === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the target field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvTarget").focus();
                return;
            }

            apiUrl += "&port=" + port + "&priority=" + priority + "&weight=" + weight + "&newPort=" + newPort + "&newValue=" + encodeURIComponent(newValue);
            break;

        case "CAA":
            var flags = divData.attr("data-record-flags");
            var tag = divData.attr("data-record-tag");

            var newFlags = $("#txtAddEditRecordDataCaaFlags").val();
            if (newFlags === "")
                newFlags = 0;

            var newTag = $("#txtAddEditRecordDataCaaTag").val();
            if (newTag === "")
                newTag = "issue";

            var newValue = $("#txtAddEditRecordDataCaaValue").val();
            if (newValue === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the authority field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataCaaValue").focus();
                return;
            }

            apiUrl += "&flags=" + flags + "&tag=" + encodeURIComponent(tag) + "&newFlags=" + newFlags + "&newTag=" + encodeURIComponent(newTag) + "&newValue=" + encodeURIComponent(newValue);
            break;
    }

    btn.button('loading');

    HTTPRequest({
        url: apiUrl,
        success: function (responseJSON) {
            $("#modalAddEditRecord").modal("hide");
            showEditZone(zone);
            showAlert("success", "Record Updated!", "Resource record was updated successfully.");
        },
        error: function () {
            btn.button('reset');
        },
        invalidToken: function () {
            showPageLogin();
        },
        objAlertPlaceholder: divAddEditRecordAlert
    });
}

function updateRecordState(objBtn, disable) {
    var btn = $(objBtn);
    var id = btn.attr("data-id");
    var divData = $("#data" + id);

    var type = divData.attr("data-record-type");
    var domain = divData.attr("data-record-name");
    var ttl = divData.attr("data-record-ttl");
    var value = divData.attr("data-record-value");

    if (domain === "")
        domain = ".";

    if (disable && !confirm("Are you sure to disable the " + type + " record '" + domain + "' with value '" + value + "'?"))
        return;

    var apiUrl = "/api/updateRecord?token=" + token + "&type=" + type + "&domain=" + encodeURIComponent(domain) + "&ttl=" + ttl + "&value=" + encodeURIComponent(value) + "&disable=" + disable;

    switch (type) {
        case "MX":
            apiUrl += "&preference=" + divData.attr("data-record-preference");
            break;

        case "SRV":
            apiUrl += "&port=" + divData.attr("data-record-port") + "&priority=" + divData.attr("data-record-priority") + "&weight=" + divData.attr("data-record-weight");
            break;

        case "DIDTXT":
            apiUrl += "&didTag=" + divData.attr("data-record-didTag") + "&didDID=" + encodeURIComponent(divData.attr("data-record-didDID")) + "&didTrace=" + "zone.js:updateRecordState"
            break;

        case "DIDSUBSIG":
            apiUrl += "&didTag=" + divData.attr("data-record-didTag") +
                "&didDID=" + encodeURIComponent(divData.attr("data-record-didDID")) +
                "&didTrace=" + "zone.js:updateRecordState"
            break;

        case "DIDSVC":
            apiUrl += "&didTag=" + divData.attr("data-record-didTag") + "&didDID=" + encodeURIComponent(divData.attr("data-record-didDID")) + "&didType=" + divData.attr("data-record-didType") + "&didDescrption=" + encodeURIComponent(divData.attr("data-record-didDescription")) + "&didTrace=" + "zone.js:updateRecordState"
            break;

        // TODO Missing DID RR types?

        case "CAA":
            apiUrl += "&flags=" + divData.attr("data-record-flags") + "&tag=" + encodeURIComponent(divData.attr("data-record-tag"));
            break;
    }

    btn.button('loading');

    HTTPRequest({
        url: apiUrl,
        success: function (responseJSON) {
            btn.button('reset');

            if (disable) {
                $("#btnEnableRecord" + id).show();
                $("#btnDisableRecord" + id).hide();

                showAlert("success", "Record Disabled!", "Resource record was disabled successfully.");
            }
            else {
                $("#btnEnableRecord" + id).hide();
                $("#btnDisableRecord" + id).show();

                showAlert("success", "Record Enabled!", "Resource record was enabled successfully.");
            }
        },
        error: function () {
            btn.button('reset');
        },
        invalidToken: function () {
            showPageLogin();
        }
    });
}

function deleteRecord(objBtn) {
    var btn = $(objBtn);
    var id = btn.attr("data-id");
    var divData = $("#data" + id);

    var domain = divData.attr("data-record-name");
    var type = divData.attr("data-record-type");
    var value = divData.attr("data-record-value");

    if (domain === "")
        domain = ".";

    if (!confirm("Are you sure to permanently delete the " + type + " record '" + domain + "' with value '" + value + "'?"))
        return false;

    var apiUrl = "/api/deleteRecord?token=" + token + "&domain=" + encodeURIComponent(domain) + "&type=" + type + "&value=" + encodeURIComponent(value);

    switch (type) {
        case "SRV":
            apiUrl += "&port=" + divData.attr("data-record-port");
            break;

        case "CAA":
            apiUrl += "&flags=" + divData.attr("data-record-flags") + "&tag=" + encodeURIComponent(divData.attr("data-record-tag"));
            break;
    }

    btn.button('loading');

    HTTPRequest({
        url: apiUrl,
        success: function (responseJSON) {
            $("#tr" + id).remove();
            $("#tableEditZoneFooter").html("<tr><td colspan=\"5\"><b>Total Records: " + $('#tableEditZone >tbody >tr').length + "</b></td></tr>");

            showAlert("success", "Record Deleted!", "Resource record was deleted successfully.");
        },
        error: function () {
            btn.button('reset');
        },
        invalidToken: function () {
            showPageLogin();
        }
    });
}
