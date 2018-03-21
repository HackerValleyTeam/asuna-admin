import { ModelsAdapter }    from './models';
import { DynamicFormTypes } from '../components/DynamicForm';

describe('identify types', () => {
  const adapter = new ModelsAdapter({});

  it('return right type', () => {
    expect(adapter.identifyType({
      config: { type: 'DATETIME' },
      name  : 'updated_at',
    })).toBe(DynamicFormTypes.Plain);

    expect(adapter.identifyType({
      config: { type: 'DATETIME' },
      name  : 'founded_at',
    })).toBe(DynamicFormTypes.DateTime);

    expect(adapter.identifyType({
      config: { type: 'DATE' },
      name  : 'founded_at',
    })).toBe(DynamicFormTypes.Date);

    expect(adapter.identifyType({
      config: { type: 'DATE' },
      name  : 'founded_at',
    })).toBe(DynamicFormTypes.Date);

    expect(adapter.identifyType({
      config: {
        foreign_keys: ['t_models.id'],
        info        : {},
        many        : true,
        selectable  : 't_models',
      },
      name  : 'models',
    })).toBe(DynamicFormTypes.ManyToMany);

    expect(adapter.identifyType({
      config: {
        foreign_keys: [],
        info        : {
          enum_data: [
            {
              key  : 'model1s',
              value: 'model1s',
            },
            {
              key  : 'model2s',
              value: 'model2s',
            },
          ],
          type     : 'EnumFilter',
        },
        nullable    : true,
        primary_key : false,
        type        : 'VARCHAR(8)',
      },
      name  : 'type',
    })).toBe(DynamicFormTypes.EnumFilter);
  });
});

test('getFormSchema matched related fields', () => {
  const adapter = new ModelsAdapter({});
  const fields  = adapter.getFormSchema({
    test_schema: [
      {
        config: {
          foreign_keys: [
            't_test_relates.id',
          ],
          info        : {
            name   : 'TEST_NAME',
            ref    : 'test_related',
            tooltip: 'tooltip-info',
          },
          nullable    : true,
          primary_key : false,
          type        : 'INTEGER',
        },
        name  : 'test_related_id',
      },
    ],
  }, 'test_schema', { test_related_id: 1 });
  expect(fields).toEqual({
    test_related: {
      name   : 'test_related',
      options: {
        foreignKeys: [
          't_test_relates.id',
        ],
        label      : 'TEST_NAME',
        name       : 'TEST_NAME',
        ref        : 'test_related',
        required   : false,
        tooltip    : 'tooltip-info',
      },
      ref    : 'test_related',
      type   : 'Association',
      value  : 1,
    },
  });
});

test('getFormSchema nullable handler', () => {
  const adapter            = new ModelsAdapter({});
  const fieldsWithNullable = adapter.getFormSchema({
    test_schema: [
      {
        config: {
          foreign_keys: [],
          info        : {},
          nullable    : true,
          primary_key : false,
          type        : 'INTEGER',
        },
        name  : 'test-nullable',
      },
    ],
  }, 'test_schema', { 'test-nullable': 1 });

  expect(fieldsWithNullable).toEqual({
    'test-nullable': {
      name   : 'test-nullable',
      options: {
        foreignKeys: [],
        required   : false,
        label      : null,
      },
      ref    : 'test-nullable',
      type   : 'InputNumber',
      value  : 1,
    },
  });

  const fieldsWithRequired = adapter.getFormSchema({
    test_schema: [
      {
        config: {
          foreign_keys: [],
          info        : {},
          nullable    : false,
          primary_key : false,
          type        : 'INTEGER',
        },
        name  : 'test-nullable',
      },
    ],
  }, 'test_schema', { 'test-nullable': 1 });

  expect(fieldsWithRequired).toEqual({
    'test-nullable': {
      name   : 'test-nullable',
      options: {
        foreignKeys: [],
        required   : true,
        label      : null,
      },
      ref    : 'test-nullable',
      type   : 'InputNumber',
      value  : 1,
    },
  });

  const fieldsWithRequiredInInfo = adapter.getFormSchema({
    test_schema: [
      {
        config: {
          foreign_keys: [],
          info        : {
            required: true,
          },
          nullable    : true,
          primary_key : false,
          type        : 'INTEGER',
        },
        name  : 'test-nullable',
      },
    ],
  }, 'test_schema', { 'test-nullable': 1 });

  expect(fieldsWithRequiredInInfo).toEqual({
    'test-nullable': {
      name   : 'test-nullable',
      options: {
        foreignKeys: [],
        required   : true,
        label      : null,
      },
      ref    : 'test-nullable',
      type   : 'InputNumber',
      value  : 1,
    },
  });

  const fieldsWithRequiredInInfoConflict = adapter.getFormSchema({
    test_schema: [
      {
        config: {
          foreign_keys: [],
          info        : {
            required: true,
          },
          nullable    : false,
          primary_key : false,
          type        : 'INTEGER',
        },
        name  : 'test-nullable',
      },
    ],
  }, 'test_schema', { 'test-nullable': 1 });

  expect(fieldsWithRequiredInInfoConflict).toEqual({
    'test-nullable': {
      name   : 'test-nullable',
      options: {
        foreignKeys: [],
        required   : true,
        label      : null,
      },
      ref    : 'test-nullable',
      type   : 'InputNumber',
      value  : 1,
    },
  });
});
