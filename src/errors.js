export class DuplicateConnectionError extends Error {
  constructor({ message, existing_institution_id } = {}) {
    super(message || 'This connection is already linked to your account.');
    this.name = 'DuplicateConnectionError';
    // eslint-disable-next-line camelcase
    this.existing_institution_id = existing_institution_id;
  }
}
