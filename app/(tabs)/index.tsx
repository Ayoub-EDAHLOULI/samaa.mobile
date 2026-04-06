import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { useTranslation } from "react-i18next";
import { identifyAudio, RecognitionResult } from "../../src/api/recognitions";
import ParticleSphere from "@/src/components/ui/ParticleSphere";

const { width } = Dimensions.get("window");
const BLUE = "#38BDF8";
const BLUE_DARK = "#1D4ED8";
const BTN = 80;

// ─── Background diagonal light streak ────────────────────────────────────────
function LightStreak({
  top,
  delay,
  rotation,
}: {
  top: number;
  delay: number;
  rotation: string;
}) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.8,
          duration: 4000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [anim, delay]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top,
        left: -100,
        width: width * 1.5,
        height: 140,
        opacity: anim,
        transform: [{ rotate: rotation }],
      }}
    >
      <LinearGradient
        colors={[
          "transparent",
          "rgba(56,189,248,0.15)",
          "rgba(37,99,235,0.05)",
          "transparent",
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}

// ─── Mic button with full animation system ────────────────────────────────────
function MicButton({
  isRecording,
  isProcessing,
  onPress,
}: {
  isRecording: boolean;
  isProcessing: boolean;
  onPress: () => void;
}) {
  // Press spring
  const pressScale = useRef(new Animated.Value(1)).current;
  // Glow halo (idle: slow breathe — recording: fast pulse)
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  // Mic icon scale pulse (recording only)
  const micPulse = useRef(new Animated.Value(1)).current;
  // 3 sonar rings
  const r1s = useRef(new Animated.Value(0)).current;
  const r1o = useRef(new Animated.Value(0)).current;
  const r2s = useRef(new Animated.Value(0)).current;
  const r2o = useRef(new Animated.Value(0)).current;
  const r3s = useRef(new Animated.Value(0)).current;
  const r3o = useRef(new Animated.Value(0)).current;

  // One sonar ring loop (no built-in delay — start staggered via setTimeout)
  const makeRingLoop = (scale: Animated.Value, opacity: Animated.Value) =>
    Animated.loop(
      Animated.sequence([
        // Snap to start position (invisible, button-size)
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        // Expand and fade
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 3.2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

  useEffect(() => {
    if (isRecording) {
      // ── Fast glow pulse ──
      const glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.5,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      glowLoop.start();

      // ── Mic icon heartbeat ──
      const micLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, {
            toValue: 1.18,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(micPulse, {
            toValue: 1.0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );
      micLoop.start();

      // ── Sonar rings (staggered) ──
      const l1 = makeRingLoop(r1s, r1o);
      const l2 = makeRingLoop(r2s, r2o);
      const l3 = makeRingLoop(r3s, r3o);

      l1.start();
      const t2 = setTimeout(() => l2.start(), 667);
      const t3 = setTimeout(() => l3.start(), 1334);

      return () => {
        glowLoop.stop();
        micLoop.stop();
        l1.stop();
        l2.stop();
        l3.stop();
        clearTimeout(t2);
        clearTimeout(t3);

        // Reset to idle state
        glowOpacity.setValue(0.3);
        micPulse.setValue(1);
        r1s.setValue(0);
        r1o.setValue(0);
        r2s.setValue(0);
        r2o.setValue(0);
        r3s.setValue(0);
        r3o.setValue(0);

        // Restart idle breathe
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowOpacity, {
              toValue: 0.6,
              duration: 2200,
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.25,
              duration: 2200,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      };
    } else {
      // ── Idle: slow gentle glow breathe ──
      const idleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.6,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.25,
            duration: 2200,
            useNativeDriver: true,
          }),
        ]),
      );
      idleLoop.start();
      return () => idleLoop.stop();
    }
  }, [isRecording]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.86,
      useNativeDriver: true,
      speed: 80,
      bounciness: 2,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 12,
    }).start();
  };

  return (
    // Container is exactly button-sized; rings overflow visibly (RN overflow:visible by default)
    <View style={s.btnWrapper}>
      {/* Sonar rings — visible outside wrapper bounds */}
      {(
        [
          [r1s, r1o],
          [r2s, r2o],
          [r3s, r3o],
        ] as [Animated.Value, Animated.Value][]
      ).map(([sc, op], i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[s.ring, { transform: [{ scale: sc }], opacity: op }]}
        />
      ))}

      {/* Glow halo — one frame larger than the button */}
      <Animated.View
        pointerEvents="none"
        style={[
          s.glowHalo,
          {
            backgroundColor: isRecording ? BLUE : "rgba(56,189,248,0.5)",
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Button (press-spring wrapper) */}
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <TouchableOpacity
          style={[
            s.btn,
            {
              shadowOpacity: isRecording ? 0.95 : 0.4,
              shadowRadius: isRecording ? 32 : 16,
            },
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isProcessing}
          activeOpacity={1}
        >
          {/* Blue gradient fill when recording */}
          {isRecording && (
            <LinearGradient
              colors={[BLUE, BLUE_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}

          {isProcessing ? (
            <ActivityIndicator
              size="small"
              color={isRecording ? "#fff" : "#000"}
            />
          ) : (
            <Animated.View style={{ transform: [{ scale: micPulse }] }}>
              <Ionicons
                name={isRecording ? "mic" : "mic-outline"}
                size={34}
                color={isRecording ? "#ffffff" : "#111111"}
              />
            </Animated.View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
    })();
  }, []);

  const startRecording = async () => {
    try {
      setResult(null);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(recording);
      setTimeout(() => stopAndAnalyze(recording), 5000);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopAndAnalyze = async (currentRecording: Audio.Recording) => {
    try {
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();
      setRecording(null);
      if (!uri) return;
      setIsProcessing(true);
      const aiResult = await identifyAudio(uri);
      setResult(aiResult);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const isRecording = !!recording;

  return (
    <View style={styles.container}>
      <LightStreak top={50} delay={0} rotation="-35deg" />
      <LightStreak top={300} delay={2000} rotation="-25deg" />

      {/* Full-screen particle sphere */}
      <ParticleSphere isAnimating={isRecording} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 40 }]}>
        {result ? (
          <View>
            <Text style={styles.titleWhite}>
              {result.isMatch ? t("home.match_found") : result.message}
            </Text>
            {result.reciter && (
              <Text style={styles.titleBlue}>{result.reciter.name}</Text>
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.titleWhite}>Identifying</Text>
            <Text style={styles.titleWhite}>recitations</Text>
            <Text style={styles.subtitle}>
              {isRecording
                ? t("home.listening")
                : isProcessing
                  ? t("home.analyzing")
                  : t("home.subtitle")}
            </Text>
          </View>
        )}
      </View>

      {/* Mic button */}
      <View style={styles.fabContainer}>
        <MicButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          onPress={
            isRecording ? () => stopAndAnalyze(recording!) : startRecording
          }
        />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // MicButton internals
  btnWrapper: {
    width: BTN,
    height: BTN,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: BLUE,
    // top/left defaults to 0 — centered because wrapper is same size as ring
  },
  glowHalo: {
    position: "absolute",
    width: BTN + 28,
    height: BTN + 28,
    borderRadius: (BTN + 28) / 2,
    top: -14,
    left: -14,
  },
  btn: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    paddingHorizontal: 32,
    zIndex: 10,
  },
  titleWhite: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  titleBlue: {
    color: BLUE,
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 8,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 8,
  },
  fabContainer: {
    position: "absolute",
    bottom: 120,
    width: "100%",
    alignItems: "center",
    zIndex: 20,
  },
});
