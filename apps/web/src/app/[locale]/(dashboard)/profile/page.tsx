"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Key, Eye, EyeSlash, CircleNotch, UploadSimple } from "@phosphor-icons/react";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const { user, setAuth } = useAuthStore();
  const { toast } = useToast();

  const refreshUser = async () => {
    try {
      const response = await api.post("/auth/refresh");
      const { accessToken } = response.data;
      if (accessToken) {
        const payloadBase64 = accessToken.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const responseMe = await api.get("/auth/me");
        const userData = {
          id: decodedPayload.sub,
          email: decodedPayload.email,
          role: decodedPayload.role,
          isActive: true,
          createdAt: "",
          updatedAt: "",
          employee: responseMe.data.employee,
        };
        setAuth(userData, accessToken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user?.employee) {
      setFirstName(user.employee.firstName || "");
      setLastName(user.employee.lastName || "");
      setPhone(user.employee.phone || "");
      setAvatarPreview(user.employee.personalData?.avatarUrl || "");
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("phone", phone);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      return api.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast(t("saveSuccess"), "success");
      refreshUser();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Erro ao atualizar dados.";
      toast(msg, "error");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      return api.put("/users/change-password", {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
    },
    onSuccess: () => {
      toast(t("passwordSuccess"), "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Erro ao alterar senha.";
      toast(msg, "error");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast("A confirmação da nova senha não confere", "error");
      return;
    }
    if (newPassword.length < 8) {
      toast("A nova senha deve ter no mínimo 8 caracteres", "error");
      return;
    }
    changePasswordMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 w-full max-w-5xl mx-auto animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subTitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: General Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-muted/10 p-6 rounded-3xl flex flex-col items-center text-center space-y-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted/40 flex items-center justify-center border-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground/60" />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="font-bold text-lg">
                {firstName} {lastName}
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">{user?.email}</p>
              <span className="inline-block text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase tracking-wider mt-2">
                {user?.role}
              </span>
            </div>

            <div className="w-full pt-4 border-t border-muted/20">
              <label className="flex items-center justify-center gap-1.5 w-full h-9 rounded-2xl bg-muted/30 hover:bg-muted/50 cursor-pointer text-xs font-bold transition-colors">
                <UploadSimple className="w-4 h-4" />
                Alterar Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* General Data Form */}
          <form
            onSubmit={handleProfileSubmit}
            className="bg-muted/5 p-6 rounded-3xl space-y-6 border-0"
          >
            <h3 className="text-base font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {t("personalInfo")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="rounded-2xl text-xs font-bold h-10 px-6 border-0 bg-primary text-primary-foreground hover:bg-primary/95"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <CircleNotch className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  {t("saving")}
                </>
              ) : (
                t("saveChanges")
              )}
            </Button>
          </form>

          {/* Change Password Form */}
          <form
            onSubmit={handlePasswordSubmit}
            className="bg-muted/5 p-6 rounded-3xl space-y-6 border-0"
          >
            <h3 className="text-base font-bold flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              {t("security")}
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? (
                      <EyeSlash className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("newPassword")}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <EyeSlash className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">{t("confirmNewPassword")}</Label>
                <div className="relative">
                  <Input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeSlash className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="rounded-2xl text-xs font-bold h-10 px-6 border-0 bg-primary text-primary-foreground hover:bg-primary/95"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <CircleNotch className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  {t("changing")}
                </>
              ) : (
                t("changePassword")
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
