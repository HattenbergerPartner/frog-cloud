export interface SettingsInterface {
  licence: {
  	key: string,
  	name: string,
  },
  server: {
  	cpu: number,
  	disk: {
  		available: number,
  		per: number,
  		total: number,
  	},
  	vm: {
  		available: number,
  		per: number,
  		total: number,
  	},
  },
  sf: {
  	config: {
  		eula_accepted: string,
  		storage_mode: string,
  		ui_mode: string,
  	},
  	memory_amount: number,
  	memory_size: string,
  	version: string,
  }
}

export interface SettingsUpdateInterface {
  licence?: {
    key: string,
    name: string,
  },
  sf?: {
    config: {
      eula_accepted: string,
      storage_mode: string,
    },
    memory_amount: number,
  },
}

export const defaultSettings: SettingsInterface = {
  licence: {
      key: "",
      name: "",
    },
    server: {
      cpu: 0,
      disk: {
        available: 0,
        per: 0,
        total: 0,
      },
      vm: {
        available: 0,
        per: 0,
        total: 0,
      },
    },
    sf: {
      config: {
        eula_accepted: "",
        storage_mode: "",
        ui_mode: "",
      },
      memory_amount: 0,
      memory_size: "",
      version: "",
    }
};
