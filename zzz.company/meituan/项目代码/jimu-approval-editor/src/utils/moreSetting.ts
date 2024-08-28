import { IComponent } from './form.type';

import {
  IMessageSetting,
  IField,
  IFormMessageSetting,
  IFormSetting,
  MessageType,
  ISetting
} from '../pages/create/more/MessageSetting.type';

/**
 * 判断属性是否在更多设置里使用
 */
export const isPropertiesUsedInMessageSetting = (
  properties: string[],
  messageSetting: IMessageSetting
) => {
  return (Object.keys(messageSetting) as MessageType[]).some(
    (key: MessageType) => {
      return messageSetting[key]?.fields.some((item: IField) => {
        return properties.indexOf(item.id) > -1;
      });
    }
  );
};

/**
 *
 * @param properties
 */
export const removeMessageSettingFields = (
  properties: string[],
  messageSetting: IMessageSetting
) => {
  (Object.keys(messageSetting) as MessageType[]).forEach((key: MessageType) => {
    if (messageSetting[key]) {
      const fileds = messageSetting[key]?.fields.filter((item) => {
        // 过滤掉存在在 properties 里的
        return properties.indexOf(item.id) === -1;
      });

      messageSetting[key].fields = fileds;
    }
  });
};

/**
 * 更新更多设置的 fields Name
 */
export const syncMoreSettingText = (
  componentList: IComponent[],
  messageSetting: IMessageSetting
) => {
  (Object.keys(messageSetting) as MessageType[]).forEach((key: MessageType) => {
    messageSetting[key]?.fields.forEach((item) => {
      const component = componentList.find((comp) => {
        return comp.id === item.id;
      });

      // 解决label清空更多设置没有同步的问题，现展示组件id
      if (component) {
        if (component.label) {
          item.name = component.label;
        } else {
          item.name = component.id;
        }
      }
    });
  });
};

export const convertMessageToData = (
  messageSetting: IMessageSetting
): IFormMessageSetting => {
  const message = {} as IFormMessageSetting;

  message.shenpiViaMessage =
    messageSetting[MessageType.PENDING]?.fastApprove || false;
  message.messages = (Object.keys(messageSetting) as MessageType[]).map(
    (key) => {
      const setting = messageSetting[key];
      return {
        messageType: key,
        messageContentParams: setting.fields?.map((field) => {
          return field.id;
        })
      } as IFormSetting;
    }
  );

  return message;
};

export const convertDataToMessage = (
  formMessageSetting: IFormMessageSetting
): IMessageSetting => {
  const messageSetting = {} as IMessageSetting;

  formMessageSetting?.messages?.forEach((item) => {
    const setting = {} as ISetting;

    if (item.messageType === MessageType.PENDING) {
      setting.fastApprove = formMessageSetting.shenpiViaMessage;
    }
    setting.fields =
      item.messageContentParams?.map((id) => {
        return {
          id
        };
      }) || [];

    messageSetting[item.messageType] = setting;
  });

  return messageSetting;
};
