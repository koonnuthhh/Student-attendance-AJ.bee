import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Button, Input, Loading } from '../components';
import { theme } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';

export default function LoginScreen({ navigation }: any) {
  const { setAuthData } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Student'); // Default to Student
  const [studentCode, setStudentCode] = useState(''); // Student code for registration

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Simple student ID validation
  const validateStudentId = () => {
    if (role === 'Student' && studentCode.trim()) {
      return studentCode.trim().length >= 3 && studentCode.trim().length <= 20;
    }
    return true;
  };

  const validateLogin = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors: { [key: string]: string } = {};

    if (!registerName.trim()) {
      newErrors.registerName = 'Name is required';
    }

    if (!registerEmail.trim()) {
      newErrors.registerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)) {
      newErrors.registerEmail = 'Invalid email format';
    }

    if (!registerPassword) {
      newErrors.registerPassword = 'Password is required';
    } else if (registerPassword.length < 6) {
      newErrors.registerPassword = 'Password must be at least 6 characters';
    }

    if (registerPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Validate student code for students - REQUIRED
    if (role === 'Student') {
      if (!studentCode.trim()) {
        newErrors.studentCode = 'Student ID is required for student accounts';
      } else if (!validateStudentId()) {
        newErrors.studentCode = 'Student ID must be between 3-20 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    setLoading(true);
    try {
      const result = await authAPI.login(email, password);
      await setAuthData(result.user, result.accessToken);
      // Navigation handled by auth state change
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Unable to login. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateRegister()) return;

    setLoading(true);
    try {
      await authAPI.register(
        registerEmail, 
        registerName, 
        registerPassword, 
        role,
        studentCode.trim() || undefined
      );
      Alert.alert(
        'Registration Successful',
        `Your ${role} account has been created successfully! You can now log in.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setIsLogin(true);
              setEmail(registerEmail);
              setPassword('');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Unable to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  if (loading) {
    return <Loading message={isLogin ? 'Logging in...' : 'Creating account...'} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Student Attendance</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Login to your account' : 'Create a new account'}
          </Text>
        </View>

        <View style={styles.form}>
          {isLogin ? (
            <>
              <Input
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors({ ...errors, email: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors({ ...errors, password: '' });
                }}
                secureTextEntry
                error={errors.password}
              />

              <Button
                title="Login"
                onPress={handleLogin}
                style={styles.submitButton}
              />

              <Button
                title="Forgot Password?"
                variant="ghost"
                onPress={() => {
                  Alert.alert('Password Reset', 'Password reset functionality coming soon!');
                }}
              />
            </>
          ) : (
            <>
              <Input
                label="Full Name"
                value={registerName}
                onChangeText={(text) => {
                  setRegisterName(text);
                  setErrors({ ...errors, registerName: '' });
                }}
                error={errors.registerName}
              />

              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Account Type:</Text>
                <View style={styles.rolePicker}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      role === 'Student' && styles.roleOptionSelected
                    ]}
                    onPress={() => setRole('Student')}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      role === 'Student' && styles.roleOptionTextSelected
                    ]}>
                      Student
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      role === 'Teacher' && styles.roleOptionSelected
                    ]}
                    onPress={() => setRole('Teacher')}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      role === 'Teacher' && styles.roleOptionTextSelected
                    ]}>
                      Teacher
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {role === 'Student' && (
                <View>
                  <Input
                    label="Student ID (Required)"
                    value={studentCode}
                    onChangeText={(text) => {
                      setStudentCode(text);
                      setErrors({ ...errors, studentCode: '' });
                    }}
                    placeholder="Enter your Student ID (e.g. STU001, 2024001)"
                    maxLength={20}
                    error={errors.studentCode}
                  />
                  <Text style={styles.helpText}>
                    💡 Use your existing university/school Student ID
                  </Text>
                </View>
              )}

              <Input
                label="Email"
                value={registerEmail}
                onChangeText={(text) => {
                  setRegisterEmail(text);
                  setErrors({ ...errors, registerEmail: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.registerEmail}
              />

              <Input
                label="Password"
                value={registerPassword}
                onChangeText={(text) => {
                  setRegisterPassword(text);
                  setErrors({ ...errors, registerPassword: '' });
                }}
                secureTextEntry
                error={errors.registerPassword}
              />

              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors({ ...errors, confirmPassword: '' });
                }}
                secureTextEntry
                error={errors.confirmPassword}
              />

              <Button
                title="Create Account"
                onPress={handleRegister}
                style={styles.submitButton}
              />
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </Text>
          <Button
            title={isLogin ? 'Sign Up' : 'Login'}
            variant="ghost"
            onPress={toggleMode}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  form: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  roleContainer: {
    marginBottom: theme.spacing.md,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  rolePicker: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleOption: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  roleOptionText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  roleOptionTextSelected: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.bold as any,
  },
  classesPreview: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight + '20',
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  classesTitle: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  classItem: {
    fontSize: 12,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  helpText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
});
