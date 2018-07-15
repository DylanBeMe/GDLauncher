// @flow
import React, { Component } from 'react';
import { Button, Icon } from 'antd';
import { lstatSync, readdirSync, watch, existsSync } from 'fs';
import { join, basename } from 'path';
import mkdirp from 'mkdirp';
import Link from 'react-router-dom/Link';
import styles from './DManager.css';
import VanillaModal from '../../containers/VanillaModal';
import DInstance from '../../containers/DInstance';
import { LAUNCHER_FOLDER, PACKS_FOLDER_NAME } from '../../constants';
import store from '../../localStore';

type Props = {};
let watcher;

export default class DManager extends Component<Props> {
  props: Props;
  constructor() {
    super();
    if (!existsSync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`)) {
      mkdirp.sync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`);
    }
    this.state = {
      instances: this.getDirectories(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`)
    };
    // Watches for any changes in the packs dir. TODO: Optimize
    watcher = watch(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`, () => {
      if (!existsSync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`)) {
        mkdirp.sync(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`);
      }
      this.setState({
        instances: this.getDirectories(`${LAUNCHER_FOLDER}/${PACKS_FOLDER_NAME}`)
      });
    });
  }

  componentWillUnmount() {
    // Stop watching for changes when this component is unmounted
    watcher.close();
  }

  /* eslint-disable */
  openLink(url) {
    require('electron').shell.openExternal(url)
  }

  isDirectory = source => lstatSync(source).isDirectory();
  getDirectories = source => readdirSync(source)
    .map(name => join(source, name))
    .filter(this.isDirectory)
    .map(dir => basename(dir));


  /* eslint-enable */

  render() {
    return (
      <div>
        <main className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerButtons}>
              <div>
                <Button type="primary" disabled className={styles.browseModpacks}>Browse Curse Modpacks</Button>
              </div>
              <div>
                <Link to={{ pathname: '/vanillaModal', state: { modal: true } }} >
                  <Button type="primary" className={styles.addVanilla}>Add New Vanilla</Button>
                </Link>
                <Button type="primary" disabled className={styles.addForge}>Add New Forge</Button>
              </div>
            </div>
          </div>
          <div className={styles.content}>
            {this.state.instances.map(element => <DInstance name={element} key={element} />)}
          </div>
        </main>
      </div>
    );
  }
}