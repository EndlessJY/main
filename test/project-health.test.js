import { readFileSync, existsSync } from 'node:fs';
import { expect } from 'chai';

const read = (path) => readFileSync(path, 'utf8');

describe('Project health checks', () => {
  it('uses the checked-in command directory for local startup', () => {
    const config = JSON.parse(read('.hcserver.json'));
    expect(config.modulesPath).to.equal('./commands');
  });

  it('does not run interactive setup during package installation', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts).to.not.have.property('postinstall');
  });

  it('keeps runtime secrets and local backups out of Docker images', () => {
    expect(existsSync('.dockerignore')).to.be.true;
    const dockerignore = read('.dockerignore');

    [
      'node_modules',
      'config.json',
      'session.key',
      'salt.key',
      'backups',
      '*.bak*',
    ].forEach((entry) => {
      expect(dockerignore).to.include(entry);
    });
  });

  it('keeps client and server nickname validation in sync', () => {
    const client = read('client/client.js');
    expect(client).to.include("var NicknamePattern = /^[\\p{L}\\p{N}_-]{1,24}$/u;");
  });

  it('has a single maintained composer script and stylesheet block', () => {
    const client = read('client/client.js');
    const style = read('client/style.css');

    expect((client.match(/\/\* Composer \*\//g) || [])).to.have.lengthOf(1);
    expect(style).to.not.include('Composer v2');
    expect(style).to.not.include('Composer v4');
    expect(style).to.not.include('Composer v5');
    expect(style).to.not.include('Composer v6');
  });
});
