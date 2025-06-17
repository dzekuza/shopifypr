import React, { useState } from 'react';
import {
  Card,
  TextField,
  Select,
  Button,
  Banner,
  LegacyStack as Stack,
  Text,
} from '@shopify/polaris';
// Local Rule type based on schema.prisma
export type Rule = {
  id: string;
  shopId: string;
  type: string;
  condition: any;
  message: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
};
import { RulesEngine } from '../lib/rulesEngine';

interface RulePreviewProps {
  rules: Rule[];
}

const RulePreview: React.FC<RulePreviewProps> = ({ rules }) => {
  const [testData, setTestData] = useState({
    total: 0,
    collections: [] as string[],
    customerTags: [] as string[],
    countryCode: 'US',
  });

  const [previewMessage, setPreviewMessage] = useState<string | null>(null);

  const handleTest = () => {
    const engine = new RulesEngine(rules);
    const message = engine.evaluateCart({
      total: testData.total,
      items: [{ productId: '1', variantId: '1', quantity: 1, collectionIds: testData.collections }],
      customerTags: testData.customerTags,
      countryCode: testData.countryCode,
    });
    setPreviewMessage(message);
  };

  return (
    <Card>
      <Stack vertical spacing="tight">
        <TextField
          label="Cart Total"
          type="number"
          value={String(testData.total)}
          onChange={(value) => setTestData({ ...testData, total: Number(value) })}
          prefix="$"
          autoComplete="off"
        />

        <TextField
          label="Collection IDs"
          value={testData.collections.join(', ')}
          onChange={(value) => setTestData({ ...testData, collections: value.split(',').map(s => s.trim()) })}
          helpText="Comma-separated collection IDs"
          autoComplete="off"
        />

        <TextField
          label="Customer Tags"
          value={testData.customerTags.join(', ')}
          onChange={(value) => setTestData({ ...testData, customerTags: value.split(',').map(s => s.trim()) })}
          helpText="Comma-separated tags"
          autoComplete="off"
        />

        <Select
          label="Country"
          options={[
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'GB' },
            // Add more countries as needed
          ]}
          value={testData.countryCode}
          onChange={(value) => setTestData({ ...testData, countryCode: value })}
        />

        <Button onClick={handleTest} variant="primary">
          Test Rules
        </Button>

        {previewMessage && (
          <Banner tone="info">
            <p><Text as="span" variant="bodyMd" fontWeight="bold">Preview Message:</Text></p>
            <div style={{ marginTop: '8px' }} dangerouslySetInnerHTML={{ __html: previewMessage }} />
          </Banner>
        )}
      </Stack>
    </Card>
  );
};

export default RulePreview; 