import { fetchInstanceRecord, gotoTab } from './api';
import { IsValidSysId } from './helpers';

const recordScript = `
  var priorityTables = [
    'sys_script_include',
    'sys_script_client',
    'sys_ui_policy',
    'sys_ux_app_route',
    'sys_ux_client_script',
    'sys_security_acl',
    'catalog_ui_policy',
    'catalog_script_client',
    'sc_cat_item_producer',
    'sys_app_module',
    'sys_aw_form_header',
  ];

  function findSysID(strSysId) {
    for (var idx = 0; idx < priorityTables.length; idx++) {
      var res = getRecord(priorityTables[idx], strSysId);

      if (res) {
        gs.print("sn-launcher-start:" + res + ":sn-launcher-end");
        return;
      }
    }

    var remainTables = [];
    var grTables = new GlideRecord('sys_db_object');
    grTables.orderByDesc('name'); // to check tables with x_ and u_ first
    var strEncodedQuery = 'sys_update_nameISNOTEMPTY';
    strEncodedQuery += '^nameISNOTEMPTY';
    strEncodedQuery += '^nameNOT LIKEts_';
    strEncodedQuery += '^nameNOT LIKEpa_scores_';
    strEncodedQuery += '^nameNOT LIKEv_';
    strEncodedQuery += '^nameNOT LIKEm2m_';
    strEncodedQuery += '^nameNOT LIKE_m2m';
    strEncodedQuery += '^nameNOT LIKE_mtom';
    strEncodedQuery += '^nameNOT LIKE000';
    strEncodedQuery += '^nameNOT LIKEsn_hr_';
    strEncodedQuery += '^nameNOT LIKEsn_esign_';
    strEncodedQuery += '^nameNOT LIKEsn_doc_';
    grTables.addEncodedQuery(strEncodedQuery);
    grTables.addQuery('name', '!=', 'sys_rollback_incremental');
    grTables.addQuery('name', '!=', 'sys_rollback_sequence');
    grTables.addQuery('name', '!=', 'sn_templated_snip_note_template');
    grTables.addQuery('name', '!=', 'sn_templated_snip_channel');
    for (var idx = 0; idx < priorityTables.length; idx++) {
      grTables.addQuery('name', '!=', priorityTables[idx]);
    }
    grTables.query();
    while (grTables.next()) {
      var strTable = grTables.getValue('name');
      remainTables.push(strTable);
    }

    for (var idx = 0; idx < remainTables.length; idx++) {
      var res = getRecord(remainTables[idx], strSysId);
      if (res) {
        gs.print("sn-launcher-start:" + res + ":sn-launcher-end");
        return;
      }
    }

    return false;
  }

  function getRecord(t, sysId) {
    try {
      var gr = new GlideRecord(t);
      gr.addQuery('sys_id', sysId);
      gr.setWorkflow(false);
      gr.setLimit(1);
      gr.queryNoDomain();
      gr.query();
      if (gr.hasNext()) {
        gr.next();
        return (
          gr.getRecordClassName() + '///' + gr.getClassDisplayValue() + '///' + gr.getDisplayValue() + '///' + gr.getLink(true)
        );
      }
    } catch (err) {
      /* ignore */
    }
    return false;
  }
`;

/**
 * Retrieves an instance record from the server using the provided sysId.
 * @param {string} sysId - The sysId of the instance record to retrieve.
 * @returns {Promise<Object>} - A Promise that resolves to an object representing the retrieved instance record.
 */
export default async function getInstanceRecord(sysId) {
  try {
    if (!IsValidSysId(sysId)) return {};

    const instanceRecordScript = `
    ${recordScript}
    findSysID('${sysId}');
  `;

    const res = await fetchInstanceRecord(instanceRecordScript);
    const regex = /sn-launcher-start:(.*):sn-launcher-end/;
    const match = regex.exec(res);
    if (match) {
      const [, type, name, link] = match[1].split('///');
      const record = {
        key: crypto.randomUUID(),
        fullLabel: `${type} / ${name}`,
        target: link,
      };

      return record;
    }

    return {};
  } catch (_) {
    return {};
  }
}

/**
 * Opens an instance record with the given sysId.
 * @param {string} sysId - The sysId of the instance record to open.
 * @returns {Promise<void>} - A Promise that resolves when the record is opened.
 */
export async function openInstanceRecord(sysId) {
  const record = await getInstanceRecord(sysId);
  const { target } = record;

  gotoTab(target);
}
