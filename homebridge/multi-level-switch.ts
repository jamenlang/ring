import { BaseDeviceAccessory } from './base-device-accessory'
import { RingDevice } from '../api'
import { HAP, hap } from './hap'
import { RingAlarmPlatformConfig } from './config'

export class MultiLevelSwitch extends BaseDeviceAccessory {
  constructor(
    public readonly device: RingDevice,
    public readonly accessory: HAP.Accessory,
    public readonly logger: HAP.Log,
    public readonly config: RingAlarmPlatformConfig
  ) {
    super()

    const { Characteristic, Service } = hap
    const { data: initialData } = this.device

    this.registerCharacteristic(
      Characteristic.On,
      Service.Lightbulb,
      data => Boolean(data.on),
      value => this.setOnState(value)
    )

    if (initialData.level !== undefined) {
      this.registerLevelCharacteristic(
        Characteristic.Brightness,
        Service.Lightbulb,
        data => (data.level && !isNaN(data.level) ? 100 * data.level : 0),
        value => this.setLevelState(value)
      )
    }

    // TODO: Hue/Sat/Color Temp
  }

  setOnState(on: boolean) {
    this.logger.info(`Turning ${this.device.name} ${on ? 'On' : 'Off'}`)

    return this.device.setInfo({ device: { v1: { on } } })
  }

  setLevelState(level: number) {
    this.logger.info(`Setting brightness of ${this.device.name} to ${level}%`)

    return this.device.setInfo({
      device: { v1: { level: level / 100 } }
    })
  }
}