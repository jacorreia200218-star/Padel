import { useEffect, useState } from 'react';

import { CheckinModal } from '../components/CheckinModal';
import { ExerciseCard } from '../components/ExerciseCard';
import { ExerciseModal } from '../components/ExerciseModal';
import { ReadinessRing } from '../components/ReadinessRing';
import { StatusBanner } from '../components/StatusBanner';
import { showToast } from '../components/Toast';
import {
  CATEGORY_LABEL,
  MUSCULAR_TIPS,
  PAIN_TIPS,
  PAIN_ZONES,
  exerciseById,
  type Exercise,
} from '../data/exercises';
import { WorkoutScreen } from '../components/WorkoutScreen';
import { generatePlan, readinessScore, type Checkin, type Plan } from '../engine/planner';
import { startSession, type Session } from '../engine/session';
import { applyProgression, levelOf, recordSession } from '../engine/progression';
import { todayKey, updateData, useStore } from '../store/useStore';

export function TodayTab() {
  const data = useStore();
  const key = todayKey();
  const checkin = data.checkins[key];
  const plan = data.plans[key];
  const session = data.session;

  const [checkinOpen, setCheckinOpen] = useState(false);
  const [redo, setRedo] = useState(false);
  const [openExercise, setOpenExercise] = useState<Exercise | null>(null);
  const [workoutOpen, setWorkoutOpen] = useState(false);

  // Se houver check-in mas ainda não um plano (por exemplo, dados importados de
  // outro dispositivo), geramos o plano na primeira renderização do dia.
  useEffect(() => {
    if (checkin && !plan) storePlan(checkin);
  }, [checkin, plan]);

  if (!checkin) {
    return (
      <>
        <div className="empty card hi">
          <span className="big-emoji">🎾</span>
          <h3 style={{ margin: '0 0 8px' }}>Ainda sem check-in hoje</h3>
          <p style={{ margin: '0 0 20px', fontSize: '0.88rem' }}>
            Responde a umas perguntas rápidas para gerar o teu plano do dia.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setRedo(false);
              setCheckinOpen(true);
            }}
          >
            Começar Check-in
          </button>
        </div>
        {checkinOpen && (
          <CheckinModal
            existing={null}
            onSubmit={(c) => {
              saveCheckin(c);
              setCheckinOpen(false);
            }}
            onClose={() => setCheckinOpen(false)}
          />
        )}
      </>
    );
  }

  if (!plan) return <div className="empty">A gerar o plano…</div>;

  const rs = readinessScore(checkin);
  // Os exercícios são mostrados já com a progressão de quem os faz, não com os
  // valores de origem da biblioteca.
  const exList = plan.exerciseIds
    .map(exerciseById)
    .filter((e): e is Exercise => Boolean(e))
    .map((e) => applyProgression(e, levelOf(data.progress, e.id)));

  return (
    <>
      <StatusBanner status={plan.status} reasons={plan.statusReasons} />

      {plan.redFlags?.length > 0 && (
        <div className="card alert">
          <b style={{ color: 'var(--coral)', fontSize: '0.88rem' }}>
            ⚠ Vale a pena falar com um profissional
          </b>
          {plan.redFlags.map((f, i) => (
            <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 6 }}>
              · {f}
            </div>
          ))}
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 10 }}>
            O plano abaixo é deliberadamente suave, mas nenhum exercício substitui uma avaliação
            médica ou de fisioterapia quando a dor é destas.
          </div>
        </div>
      )}

      <div className="card hi">
        <div className="ring-wrap">
          <ReadinessRing pct={rs / 10} status={plan.status} />
          <div>
            <div className="ring-label-big">{plan.planType}</div>
            <div className="ring-sub">
              ~{plan.duration} min · prontidão {rs}/10
            </div>
          </div>
        </div>
        <div className="chip-row" style={{ marginTop: 14 }}>
          {plan.focus.map((c) => (
            <span key={c} className="tag">
              {CATEGORY_LABEL[c]}
            </span>
          ))}
        </div>
        {plan.reasoning.length > 0 && (
          <>
            <div className="divider-lines" />
            {plan.reasoning.map((r, i) => (
              <div
                key={i}
                style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 6 }}
              >
                ✦ {r}
              </div>
            ))}
          </>
        )}
      </div>

      <div className="section-title">Exercícios de hoje</div>
      {exList.map((e) => (
        <ExerciseCard
          key={e.id}
          exercise={e}
          level={levelOf(data.progress, e.id)}
          onClick={() => setOpenExercise(e)}
        />
      ))}

      <RecoveryTips plan={plan} />

      {plan.completed ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>
          ✓ Dia concluído
        </div>
      ) : (
        <button
          className="btn btn-primary"
          style={{ marginTop: 8 }}
          onClick={() => {
            // Retomar não recomeça: a sessão guardada mantém onde ficou.
            if (!session || session.date !== key) {
              updateData((d) => {
                d.session = startSession(key, plan.exerciseIds);
              });
            }
            setWorkoutOpen(true);
          }}
        >
          {session && session.date === key && session.index > 0
            ? `Retomar treino (${session.index + 1}/${session.exerciseIds.length})`
            : 'Começar treino'}
        </button>
      )}

      <button
        className="btn btn-ghost"
        style={{ marginTop: 10 }}
        onClick={() => {
          setRedo(true);
          setCheckinOpen(true);
        }}
      >
        Refazer check-in de hoje
      </button>

      {checkinOpen && (
        <CheckinModal
          existing={redo ? checkin : null}
          onSubmit={(c) => {
            saveCheckin(c);
            setCheckinOpen(false);
          }}
          onClose={() => setCheckinOpen(false)}
        />
      )}
      {openExercise && (
        <ExerciseModal
          exercise={openExercise}
          onClose={() => setOpenExercise(null)}
          onOpen={setOpenExercise}
        />
      )}
      {workoutOpen && session && (
        <WorkoutScreen
          session={session}
          equipment={checkin.equipment}
          progress={data.progress}
          onUpdate={(next) => updateData((d) => void (d.session = next))}
          onFinish={(next) => {
            finishWorkout(next);
          }}
          onClose={() => setWorkoutOpen(false)}
        />
      )}
    </>
  );
}

/** Gera e guarda o plano do dia, registando que exercícios saíram e quando. */
function storePlan(checkin: Checkin) {
  updateData((d) => {
    const p = generatePlan(checkin, d.goals, d.exerciseLastUsed);
    d.plans[checkin.date] = p;
    p.exerciseIds.forEach((id) => {
      d.exerciseLastUsed[id] = checkin.date;
    });
  });
}

function saveCheckin(checkin: Checkin) {
  const ok = updateData((d) => {
    d.checkins[checkin.date] = checkin;
    const p = generatePlan(checkin, d.goals, d.exerciseLastUsed);
    d.plans[checkin.date] = p;
    p.exerciseIds.forEach((id) => {
      d.exerciseLastUsed[id] = checkin.date;
    });
    // Refazer o check-in gera outro plano: uma sessão a meio do plano anterior
    // deixaria de fazer sentido, e retomá-la mostraria exercícios que já não
    // pertencem ao dia.
    if (d.session?.date === checkin.date) d.session = null;
  });
  if (!ok) showToast('Não foi possível guardar neste ambiente. Abre a app no Safari do iPhone.');
}

/**
 * Fecha o treino: marca o dia, escreve o registo do histórico e guarda os
 * exercícios que provocaram dor, para o motor os evitar nos dias seguintes.
 */
function finishWorkout(session: Session) {
  const key = todayKey();
  const ok = updateData((d) => {
    const checkin = d.checkins[key];
    const plan = d.plans[key];
    if (!checkin || !plan) return;
    plan.completed = true;
    d.session = { ...session, finishedAt: new Date().toISOString() };

    const { progress, leveledUp } = recordSession(d.progress, session);
    d.progress = progress;
    if (leveledUp.length) {
      const nomes = leveledUp.map((id) => exerciseById(id)?.name).filter(Boolean);
      showToast(`Subiste de nível: ${nomes.join(', ')}`);
    }
    // Um exercício que doeu hoje é tratado como usado agora, para descer na
    // ordem de escolha e não voltar já amanhã.
    session.painful.forEach((id) => {
      d.exerciseLastUsed[id] = key;
    });
    const hoursVal = checkin.hours === '3+' ? 3 : parseFloat(checkin.hours || '1.5');
    d.logs[key] = {
      date: key,
      didTrain: true,
      didPlayPadel: checkin.playingToday !== 'none',
      padelHours: checkin.playingToday !== 'none' ? hoursVal : 0,
      fatigue: checkin.fatigue,
      pain: checkin.injuries.length,
      sleep: checkin.sleepQuality,
      energy: checkin.energy,
    };
  });
  if (!ok) showToast('Não foi possível guardar neste ambiente. Abre a app no Safari do iPhone.');
}

function RecoveryTips({ plan }: { plan: Plan }) {
  const realZones = plan.realPainZones ?? [];
  const muscZones = plan.muscularZones ?? [];
  if (!realZones.length && !muscZones.length) return null;

  return (
    <>
      <div className="section-title">Dicas de recuperação</div>
      <div className="card">
        {realZones.map((id) => (
          <div key={id} style={{ marginBottom: 10 }}>
            <b style={{ color: 'var(--coral)', fontSize: '0.82rem' }}>
              {PAIN_ZONES.find((z) => z.id === id)?.label} · dor
            </b>
            {(PAIN_TIPS[id] ?? []).map((t, i) => (
              <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 4 }}>
                ❄ {t}
              </div>
            ))}
          </div>
        ))}
        {muscZones.length > 0 && (
          <div>
            <b style={{ color: 'var(--amber)', fontSize: '0.82rem' }}>Cansaço muscular</b>
            {MUSCULAR_TIPS.map((t, i) => (
              <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 4 }}>
                ✦ {t}
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 12 }}>
          Estas são dicas gerais de autocuidado, não substituem avaliação por um profissional de
          saúde.
        </div>
      </div>
    </>
  );
}
