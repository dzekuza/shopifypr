import React, { useState, useCallback } from 'react';
import {
  Card,
  FormLayout,
  TextField,
  Select,
  ColorPicker,
  RangeSlider,
  Button,
} from '@shopify/polaris';

interface ThemeSettings {
  backgroundColor: { hue: number; saturation: number; brightness: number; alpha: number };
  textColor: { hue: number; saturation: number; brightness: number; alpha: number };
  borderColor: { hue: number; saturation: number; brightness: number; alpha: number };
  borderRadius: number;
  padding: number;
  fontSize: number;
  position: 'top' | 'bottom';
  animation: 'none' | 'fade' | 'slide';
}

interface ThemeSettingsProps {
  shopId: string;
  initialSettings?: Partial<ThemeSettings>;
  onSave: (settings: ThemeSettings) => Promise<void>;
}

const defaultColor = { hue: 0, saturation: 0, brightness: 1, alpha: 1 };
const defaultSettings: ThemeSettings = {
  backgroundColor: defaultColor,
  textColor: defaultColor,
  borderColor: defaultColor,
  borderRadius: 4,
  padding: 16,
  fontSize: 14,
  position: 'top',
  animation: 'fade',
};

const ThemeSettings: React.FC<ThemeSettingsProps> = ({
  shopId,
  initialSettings = {},
  onSave,
}) => {
  const [settings, setSettings] = useState<ThemeSettings>({
    ...defaultSettings,
    ...initialSettings,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
    setIsSaving(false);
  }, [settings, onSave]);

  return (
    <Card>
      <FormLayout>
        <div>
          <ColorPicker
            onChange={(color) => setSettings({ ...settings, backgroundColor: color })}
            color={settings.backgroundColor}
            allowAlpha
          />
        </div>
        <div>
          <ColorPicker
            onChange={(color) => setSettings({ ...settings, textColor: color })}
            color={settings.textColor}
            allowAlpha
          />
        </div>
        <div>
          <ColorPicker
            onChange={(color) => setSettings({ ...settings, borderColor: color })}
            color={settings.borderColor}
            allowAlpha
          />
        </div>
        <RangeSlider
          label="Border Radius"
          value={settings.borderRadius}
          min={0}
          max={20}
          onChange={(value: number) => setSettings({ ...settings, borderRadius: value })}
          output
        />
        <RangeSlider
          label="Padding"
          value={settings.padding}
          min={8}
          max={32}
          onChange={(value: number) => setSettings({ ...settings, padding: value })}
          output
        />
        <RangeSlider
          label="Font Size"
          value={settings.fontSize}
          min={12}
          max={24}
          onChange={(value: number) => setSettings({ ...settings, fontSize: value })}
          output
        />
        <Select
          label="Position"
          options={[
            { label: 'Top of Cart', value: 'top' },
            { label: 'Bottom of Cart', value: 'bottom' },
          ]}
          value={settings.position}
          onChange={(value) =>
            setSettings({ ...settings, position: value as 'top' | 'bottom' })
          }
        />
        <Select
          label="Animation"
          options={[
            { label: 'None', value: 'none' },
            { label: 'Fade', value: 'fade' },
            { label: 'Slide', value: 'slide' },
          ]}
          value={settings.animation}
          onChange={(value) =>
            setSettings({
              ...settings,
              animation: value as 'none' | 'fade' | 'slide',
            })
          }
        />
        <Button onClick={handleSave} variant="primary" loading={isSaving}>
          Save Theme Settings
        </Button>
      </FormLayout>
    </Card>
  );
};

export default ThemeSettings; 