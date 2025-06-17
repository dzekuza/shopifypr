import React, { useCallback, useEffect, useState } from 'react';
import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  Button,
  Modal,
  Form,
  FormLayout,
  Select,
  TextField,
  LegacyStack as Stack,
  Text,
  Banner,
} from '@shopify/polaris';
import { useAppBridge } from '@shopify/app-bridge-react';
import type { Rule } from '../../lib/rulesEngine';

const AdminPage: React.FC = () => {
  const app = useAppBridge();
  const [rules, setRules] = useState<Rule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [formData, setFormData] = useState({
    type: 'cart_total',
    message: '',
    isActive: true,
    priority: 0,
    condition: {
      operator: '>',
      value: 0,
    },
  });

  const fetchRules = useCallback(async () => {
    const response = await fetch('/api/rules');
    const data = await response.json();
    setRules(data);
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleSubmit = async () => {
    const method = selectedRule ? 'PUT' : 'POST';
    const url = selectedRule ? `/api/rules/${selectedRule.id}` : '/api/rules';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    setIsModalOpen(false);
    setSelectedRule(null);
    fetchRules();
  };

  const renderConditionFields = () => {
    switch (formData.type) {
      case 'cart_total':
        return (
          <>
            <Select
              label="Operator"
              options={[
                { label: 'Greater than', value: '>' },
                { label: 'Less than', value: '<' },
                { label: 'Equal to', value: '==' },
              ]}
              value={formData.condition.operator}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  condition: { ...formData.condition, operator: value },
                })
              }
            />
            <TextField
              label="Amount"
              type="number"
              value={String(formData.condition.value)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  condition: { ...formData.condition, value: Number(value) },
                })
              }
              prefix="$"
              autoComplete="off"
            />
          </>
        );
      // Add other condition types here
      default:
        return null;
    }
  };

  return (
    <Page
      title="Cart Message Rules"
      primaryAction={{
        content: 'Add Rule',
        onAction: () => {
          setSelectedRule(null);
          setIsModalOpen(true);
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              items={rules}
              renderItem={(rule) => (
                <ResourceItem
                  id={rule.id}
                  onClick={() => {
                    setSelectedRule(rule);
                    setFormData({
                      type: rule.type,
                      message: rule.message,
                      isActive: rule.isActive,
                      priority: rule.priority,
                      condition: rule.condition as any,
                    });
                    setIsModalOpen(true);
                  }}
                >
                  <Stack>
                    <Stack.Item fill>
                      <h3>
                        <Text as="span" variant="bodyMd" fontWeight="bold">{rule.message}</Text>
                      </h3>
                      <div>Type: {rule.type}</div>
                    </Stack.Item>
                    <Stack.Item>
                      <Button
                        onClick={() => {
                          // Handle delete
                          if (
                            window.confirm('Are you sure you want to delete this rule?')
                          ) {
                            fetch(`/api/rules/${rule.id}`, { method: 'DELETE' }).then(
                              fetchRules
                            );
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </Stack.Item>
                  </Stack>
                </ResourceItem>
              )}
            />
          </Card>
        </Layout.Section>

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedRule ? 'Edit Rule' : 'Add Rule'}
          primaryAction={{
            content: selectedRule ? 'Save Changes' : 'Add Rule',
            onAction: handleSubmit,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setIsModalOpen(false),
            },
          ]}
        >
          <Modal.Section>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <Select
                  label="Rule Type"
                  options={[
                    { label: 'Cart Total', value: 'cart_total' },
                    { label: 'Collection', value: 'collection' },
                    { label: 'Customer Tag', value: 'customer_tag' },
                    { label: 'Country', value: 'country' },
                  ]}
                  value={formData.type}
                  onChange={(value) => setFormData({ ...formData, type: value })}
                />

                {renderConditionFields()}

                <TextField
                  label="Message"
                  value={formData.message}
                  onChange={(value) => setFormData({ ...formData, message: value })}
                  multiline={3}
                  autoComplete="off"
                />

                <TextField
                  label="Priority"
                  type="number"
                  value={String(formData.priority)}
                  onChange={(value) => setFormData({ ...formData, priority: Number(value) })}
                  helpText="Higher priority rules are evaluated first"
                  autoComplete="off"
                />
              </FormLayout>
            </Form>
          </Modal.Section>
        </Modal>
      </Layout>
    </Page>
  );
};

export default AdminPage; 