import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeObjectCoverPoint,
  computeViewportVisorAnchor,
  getNextSlide,
  getPrevSlide,
  parseCampaignResponse,
  resolveCommandTarget,
  triggerPresentationLaunch,
  validateCampaignInput,
} from './presentation';

test('resolveCommandTarget maps every header and step control accurately', () => {
  assert.equal(resolveCommandTarget('accueil'), 'accueil');
  assert.equal(resolveCommandTarget('strategie'), 'attirer');
  assert.equal(resolveCommandTarget('recit'), 'engager');
  assert.equal(resolveCommandTarget('demarrer'), 'attirer');
  assert.equal(resolveCommandTarget('attirer'), 'attirer');
  assert.equal(resolveCommandTarget('engager'), 'engager');
  assert.equal(resolveCommandTarget('convertir'), 'convertir');
});

test('getNextSlide and getPrevSlide step cleanly across the four screens and clamp at bounds', () => {
  assert.equal(getNextSlide('accueil'), 'attirer');
  assert.equal(getNextSlide('attirer'), 'engager');
  assert.equal(getNextSlide('engager'), 'convertir');
  assert.equal(getNextSlide('convertir'), 'convertir');

  assert.equal(getPrevSlide('convertir'), 'engager');
  assert.equal(getPrevSlide('engager'), 'attirer');
  assert.equal(getPrevSlide('attirer'), 'accueil');
  assert.equal(getPrevSlide('accueil'), 'accueil');
});

test('triggerPresentationLaunch locks double-clicks and honors reduced motion', () => {
  assert.equal(triggerPresentationLaunch('waiting', false), 'playing');
  assert.equal(triggerPresentationLaunch('waiting', true), 'complete');
  // Locked once playing or already revealed
  assert.equal(triggerPresentationLaunch('playing', false), 'playing');
  assert.equal(triggerPresentationLaunch('playing', true), 'playing');
  assert.equal(triggerPresentationLaunch('complete', false), 'complete');
  assert.equal(triggerPresentationLaunch('complete', true), 'complete');
});

test('computeObjectCoverPoint anchors visor (47%, 46%) accurately on 16:9, 16:10, and mobile crops', () => {
  const fullHd = computeObjectCoverPoint(1920, 1080, 1600, 900, 0.47, 0.46, 0.5, 0.5);
  assert.ok(Math.abs(fullHd.x - 1920 * 0.47) < 0.01);
  assert.ok(Math.abs(fullHd.y - 1080 * 0.46) < 0.01);

  const laptop = computeObjectCoverPoint(1366, 768, 1600, 900, 0.47, 0.46, 0.5, 0.5);
  assert.ok(Math.abs(laptop.x - 1366 * 0.47) < 1.0);
  assert.ok(Math.abs(laptop.y - 768 * 0.46) < 1.0);

  const mobile = computeObjectCoverPoint(390, 320, 1600, 900, 0.47, 0.46, 0.54, 0.36);
  assert.ok(mobile.x > 165 && mobile.x < 176);
  assert.ok(Math.abs(mobile.y - 320 * 0.46) < 0.01);
});

test('computeViewportVisorAnchor maps mobile inset portrait stage to viewport coordinates', () => {
  // Mobile portrait card sitting at left=16, top=68, size=358x224 inside 390x844 viewport
  const mobileAnchor = computeViewportVisorAnchor(
    { left: 16, top: 68, width: 358, height: 224 },
    390,
    844,
    1408,
    768,
    0.47,
    0.46,
    0.54,
    0.36,
  );
  assert.ok(mobileAnchor.x > 160 && mobileAnchor.x < 200);
  assert.ok(mobileAnchor.y > 165 && mobileAnchor.y < 180);
  assert.ok(mobileAnchor.maxCornerDistance > 680);
});

test('validateCampaignInput enforces required fields while allowing optional channel', () => {
  const empty = validateCampaignInput({
    project: '  ',
    target: '',
    goal: '',
    channel: '',
  });
  assert.equal(empty.valid, false);
  assert.ok(empty.errors.project);
  assert.ok(empty.errors.target);
  assert.ok(empty.errors.goal);

  const valid = validateCampaignInput({
    project: '  Atelier Céramique Nord  ',
    target: 'Jeunes actifs urbains',
    goal: 'Remplir les ateliers du week-end',
    channel: '',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.sanitized.project, 'Atelier Céramique Nord');
  assert.equal(valid.sanitized.channel, '');
});

test('parseCampaignResponse validates structured three-part Gemini output', () => {
  assert.equal(parseCampaignResponse(null), null);
  assert.equal(parseCampaignResponse({ attirer: {} }), null);

  const parsed = parseCampaignResponse({
    attirer: {
      accroche: 'Et si votre samedi avait le goût de la terre fraîche ?',
      formatConseille: 'Réel Instagram 25 s',
      justificationFormat: 'Montre le geste dès la première seconde.',
    },
    engager: {
      recitCourt: 'Après une semaine d’écrans, vos mains réclament du concret...',
      situation: 'Semaine saturée d’écrans.',
      tension: 'Difficile de décrocher vraiment.',
      transformation: 'En 2 heures, vous repartez avec votre propre tasse.',
    },
    convertir: {
      appelAction: 'Réserver ma place pour samedi (8 places)',
      indicateurCle: 'Taux d’inscription sur la page atelier',
      methodeMesure: 'Suivi UTM depuis le lien en bio.',
    },
  });

  assert.ok(parsed);
  assert.equal(parsed.attirer.formatConseille, 'Réel Instagram 25 s');
  assert.equal(parsed.convertir.indicateurCle, 'Taux d’inscription sur la page atelier');
});
