define(['dojo/_base/declare',
    'jimu/BaseWidget',
    'dojo',
    'dojo/request',
    'esri/geometry/Extent',
    'esri/geometry/Point',
    'esri/SpatialReference',
    'https://geology.deq.ms.gov/script/wgxpath.install.js'],
  function (declare, BaseWidget, dojo, request, Extent, Point, SpatialReference) {
      var _PLSLayer;
      var _PLSXMLDoc;

    //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {
        // Custom widget code goes here
        baseClass: 'jimu-widget-ShowPLS',
        
        //this property is set by the framework when widget is loaded.
        name: 'ShowPLS',
        
        //methods to communication with app container:

        postCreate: function () {
            this.inherited(arguments);
            var parser = new DOMParser();
            var xml = parser.parseFromString('<?xml version="1.0" encoding="utf-8"?><root></root>', "application/xml");
            if (!xml.evaluate) {
                if (!document.evaluate) { wgxpath.install();};
            };
        },

        startup: function () {
            if (!_PLSXMLDoc) {
                //var req = '../../data/pls.xml';
                var req = require.toUrl('widgets/ShowPLS/pls.xml');
                request(req, { handleAs: "xml" }).then(
                    function (inc) {
                        _PLSXMLDoc = inc;

                        var cboCounties = dojo.byId("plsCboCounties");
                        if (cboCounties.options.length < 2) {
                            var o;
                            var xpathResult;
                            var ss;

                            while (cboCounties.options.length > 0) {
                                cboCounties.remove(0);
                            };

                            o = new Option(" ");
                            cboCounties.options.add(o);
                            if (_PLSXMLDoc.evaluate) {
                                xpathResult = _PLSXMLDoc.evaluate("/MSPLS/County", _PLSXMLDoc, null, XPathResult.ANY_TYPE, null);
                            } else {
                                xpathResult = document.evaluate("/MSPLS/County", _PLSXMLDoc, null, XPathResult.ANY_TYPE, null);
                            };

                            ss = xpathResult.iterateNext();
                            var i = 0;
                            while (ss != null) {
                                o = new Option(ss.getAttribute('name'));
                                cboCounties.options.add(o);
                                ss = xpathResult.iterateNext();
                            }
                        };
                    },
                    function (error) { console.log("An error occurred: " + error); }
                    );
            };


        this.inherited(arguments);
       },

      // onOpen: function(){
      //   console.log('onOpen');
      // },

      // onClose: function(){
      //   console.log('onClose');
      // },

      // onMinimize: function(){
      //   console.log('onMinimize');
      // },

      // onMaximize: function(){
      //   console.log('onMaximize');
      // },

      // onSignIn: function(credential){
      //   /* jshint unused:false*/
      //   console.log('onSignIn');
      // },

      // onSignOut: function(){
      //   console.log('onSignOut');
      // },

      // onPositionChange: function(){
      //   console.log('onPositionChange');
      // },

      // resize: function(){
      //   console.log('resize');
      // },

        plsCboChange: function plsCboChange(evt) {
            var inc = evt.currentTarget;
            var cboCounties, cboTwnRng, cboSec;
            var CountyId, CountyName, Twn, Rng, Dis, Sec;
            var Tbl;
            var xpathResult;

            var sExt, oExt;
            var it, sr, o;
            var x1, y1, x2, y2, w, h;

            var plsFull, p, qs0, qs;
            var cbo;
            switch (inc.id) {
                case "plsCboCounties":
                    CountyId = inc.selectedIndex + (inc.selectedIndex - 1);
                    Tbl = dojo.byId("tblPLS");
                    if (CountyId > 0) {
                        // County Selected, Load TwnRng
                        if (_PLSXMLDoc.evaluate) {
                            xpathResult = _PLSXMLDoc.evaluate("/MSPLS/County[@id='" + CountyId + "']", _PLSXMLDoc, null, 0, null);
                        } else {
                            xpathResult = document.evaluate("/MSPLS/County[@id='" + CountyId + "']", _PLSXMLDoc, null, 0, null);
                        };

                        it = xpathResult.iterateNext();
                        sExt = new String(it.getAttribute('extents')).split(",");

                        var sr = new SpatialReference(this.map.spatialReference.wkid);
                        var x1, y1, x2, y2, w, h;
                        x1 = parseFloat(sExt[0]);
                        y1 = parseFloat(sExt[1]);
                        w = parseFloat(sExt[2]);
                        h = parseFloat(sExt[3]);
                        x2 = x1 + w;
                        y2 = y1 + h;

                        Ext = new Extent(x1, y1, x2, y2, sr);
                        this.map.setExtent(Ext, true);

                        Tbl.rows[1].style.visibility = "visible";
                        Tbl.rows[2].style.visibility = "collapse";
                    } else {
                        //Nothing selected, clear and hide other cbo

                        cbo = dojo.byId("plsCboTwnRng");
                        while (cbo.options.length > 0) {
                            cbo.remove(0);
                        };

                        cbo = dojo.byId("plsCboSection");
                        while (cbo.options.length > 0) {
                            cbo.remove(0);
                        };

                        Tbl.rows[1].style.visibility = "collapse";
                        Tbl.rows[2].style.visibility = "collapse";
                    };

                    if (_PLSXMLDoc.evaluate) {
                        xpathResult = _PLSXMLDoc.evaluate("/MSPLS/County[@id='" + CountyId + "']/Township", _PLSXMLDoc, null, 0, null);
                    } else {
                        xpathResult = document.evaluate("/MSPLS/County[@id='" + CountyId + "']/Township", _PLSXMLDoc, null, 0, null);
                    };

                    it = xpathResult.iterateNext();

                    cboTwnRng = dojo.byId("plsCboTwnRng");
                    while (cboTwnRng.options.length > 0) {
                        cboTwnRng.remove(0);
                    };

                    o = new Option(" ");
                    cboTwnRng.options.add(o);

                    while (it) {
                        Twn = it.getAttribute('twn');
                        Rng = it.getAttribute('rng');
                        Dis = it.getAttribute('meridian_id');

                        o = new Option(Twn + "-" + Rng + "-" + Dis);
                        cboTwnRng.options.add(o);

                        it = xpathResult.iterateNext();
                    };
                    break;

                case "plsCboTwnRng":

                    Tbl = dojo.byId("tblPLS");
                    if (inc.selectedIndex > 0) {
                        // County Selected, Load TwnRng
                        Tbl.rows[2].style.visibility = "visible";
                        cboCounties = dojo.byId("plsCboCounties");
                        CountyId = cboCounties.selectedIndex + (cboCounties.selectedIndex - 1);

                        cboSec = dojo.byId("plsCboSection");
                        while (cboSec.options.length > 0) {
                            cboSec.remove(0);
                        };
                        o = new Option(" ");
                        cboSec.options.add(o);

                        // /MSPLS/County[1]/Township[1]/Section[4]
                        plsFull = new String(inc.value);
                        p = plsFull.split('-');
                        qs0 = "@twn='" + p[0] + "' and @rng='" + p[1] + "' and @meridian_id='" + p[2] + "'";
                        qs = "/MSPLS/County[@id='" + CountyId + "']/Township[" + qs0 + "]";

                        if (_PLSXMLDoc.evaluate) {
                            xpathResult = _PLSXMLDoc.evaluate(qs, _PLSXMLDoc, null, 0, null);
                        } else {
                            xpathResult = document.evaluate(qs, _PLSXMLDoc, null, 0, null);
                        };

                        it = xpathResult.iterateNext();

                        sExt = new String(it.getAttribute('extents')).split(",");

                        x1 = parseFloat(sExt[0]);
                        y1 = parseFloat(sExt[1]);
                        w = parseFloat(sExt[2]);
                        h = parseFloat(sExt[3]);
                        x2 = x1 + w;
                        y2 = y1 + h;

                        sr = new SpatialReference(this.map.spatialReference.wkid);
                        Ext = new Extent(x1, y1, x2, y2, sr);
                        this.map.setExtent(Ext, false);

                        for (var i = 0; i < it.childNodes.length - 1; i++) {
                            var its = it.childNodes[i];
                            if (its.nodeName == "Section") {
                                o = new Option(its.getAttribute('id'));
                                cboSec.options.add(o);
                            };
                        }
                    } else {
                        //Nothing selected, clear and hide other cbo
                        cbo = dojo.byId("plsCboSection");
                        while (cbo.options.length > 0) {
                            cbo.remove(0);
                        };
                        Tbl.rows[2].style.visibility = "collapse";
                    };

                    break;

                case "plsCboSection":
                    if (inc.selectedIndex > 0) {
                        cboCounties = dojo.byId("plsCboCounties");
                        CountyId = cboCounties.selectedIndex + (cboCounties.selectedIndex - 1);

                        cboTwnRng = dojo.byId("plsCboTwnRng");
                        plsFull = new String(cboTwnRng.value);
                        p = plsFull.split('-');

                        cboSec = dojo.byId("plsCboSection");
                        Sec = cboSec.value;

                        qs0 = "@twn='" + p[0] + "' and @rng='" + p[1] + "' and @meridian_id='" + p[2] + "'";
                        qs = "/MSPLS/County[@id='" + CountyId + "']/Township[" + qs0 + "]/Section[@id='" + Sec + "']";
                        if (_PLSXMLDoc.evaluate) {
                            xpathResult = _PLSXMLDoc.evaluate(qs, _PLSXMLDoc, null, 0, null);
                        } else {
                            xpathResult = document.evaluate(qs, _PLSXMLDoc, null, 0, null);
                        };
                        it = xpathResult.iterateNext();

                        var Center = new String(it.getAttribute('center')).split(",");
                        x1 = parseFloat(Center[0]);
                        y1 = parseFloat(Center[1]);
                        sr = new SpatialReference(this.map.spatialReference.wkid);
                        var CenterPt = new Point(x1, y1, sr);
                        this.map.centerAndZoom(CenterPt, 15);
                    };
            };
       }

    });
  });