/*** AntiSnowFloor Z-Way Home Automation module *************************************

 Version: 0.0.1
 (c) OOO "DAS", 2018 
 http://www.das-ooo.ru/ 

 -----------------------------------------------------------------------------
 Author: Izotov Yury <iz.iot@mail.ru>,  <sale@das-ooo.ru> 
 Description:
	 Switch heating floor (snow/rain - On; no snow/rain - Off)

******************************************************************************/

// ----------------------------------------------------------------------------
// --- Class definition, inheritance and setup
// ----------------------------------------------------------------------------

function AntiSnowFloor (id, controller) {
	// Call superconstructor first (AutomationModule)
	AntiSnowFloor.super_.call(this, id, controller);
};

inherits(AntiSnowFloor, AutomationModule);

_module = AntiSnowFloor;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

AntiSnowFloor.prototype.init = function (config) {
	// Call superclass' init (this will process config argument and so on)
	AntiSnowFloor.super_.prototype.init.call(this, config);

	// Remember "this" for detached callbacks (such as event listener callbacks)
	var self = this;

	this.handler = function (vDev) {
		var value = vDev.get("metrics:level");
		self.vDevNew.set("metrics:level", value);
	};
	
	//Create vDev
	this.createControlDev = function () {
		var ctrlPanel = self.controller.devices.get(self.config.controlPanel);
		var rainTrig = self.controller.devices.get(self.config.rainTrigger);
		//ctrlPanel.set("visibility", !(self.config.hide));

		self.vDevNew = self.controller.devices.create({
				deviceId: "AntiSnowFloor_" + self.id,
				defaults: {
					deviceType: "sensorBinary",
					metrics: {
						level: 'off',
						icon: ctrlPanel.get("metrics:icon"),
						title: self.langFile.m_title + " " + self.id,
					}
				},
				overlay: {},
				moduleId: self.id
		});

		// Setup metric update event listener
		self.controller.devices.on(self.config.device, 'change:metrics:level', self.handler);
		
		//setTimeout(_.bind(self.initCallback,self),60*1000);
    	//self.interval = setInterval(_.bind(self.checkRain,self,'interval'),10*60*1000);
	}

	this.deviceCreated = function (vDev) {
		if (vDev.id === self.config.device) {
			self.createControlDev();
		}
	}

	this.deviceRemoved = function (vDev) {
		if (vDev.id === self.controller.devices.get(self.config.device)) {
			self.controller.devices.remove("AntiSnowFloor_" + self.id);
		}
	}

	// Bind to event "Added new device" -- > Bind to new device
	this.controller.devices.on('created', this.deviceCreated);   

	 // Bind to event "Removed device" --> Unbind device
	this.controller.devices.on('removed', this.deviceRemoved); 

	if (this.controller.devices.get(this.config.device)) {
		self.createControlDev();
	}

};

AntiSnowFloor.prototype.stop = function () {
	AntiSnowFloor.super_.prototype.stop.call(this);
	this.controller.devices.off(this.config.controlPanel, 'change:metrics:level', this.handler);
	this.controller.devices.off(this.config.rainTrigger, 'change:metrics:level', this.handler);
	this.controller.devices.remove("AntiSnowFloor_" + this.id);
};
// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

// This module doesn't have any additional methods
