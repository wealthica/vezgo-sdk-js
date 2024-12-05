"use client";

import { Dispatch, SetStateAction } from "react";

export default function Modal({
  accountId,
  setAccountId,
  setShowModal,
  handleGetAccount,
  handleGetTxns,
  handleSyncAccount,
  handleRemoveAccount,
}: {
  accountId: string;
  setAccountId: Dispatch<SetStateAction<string>>;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  handleGetAccount: () => void;
  handleGetTxns: () => void;
  handleSyncAccount: () => void;
  handleRemoveAccount: () => void;
}) {
  return (
    <div id="customModal" className="modal show">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Enter Account ID</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => {
                setShowModal(false);
              }}
            ></button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="account_id_mod">Account ID:</label>
              <input
                type="text"
                id="account_id_mod"
                className="form-control"
                placeholder="Enter Account ID"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-info"
              onClick={handleGetAccount}
            >
              Get Account
            </button>
            <button
              type="button"
              className="btn btn-info"
              onClick={handleGetTxns}
            >
              Get Transactions
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleSyncAccount}
            >
              Sync Account
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleRemoveAccount}
            >
              Remove Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
