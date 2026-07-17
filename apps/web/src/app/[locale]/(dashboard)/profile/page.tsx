"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, Option } from "@/components/ui/select";
import { User, Key, UploadSimple, CircleNotch, House, CreditCard } from "@phosphor-icons/react";
import { FormSectionHeader } from "@/components/form-section-header";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const tDashboard = useTranslations("Dashboard");
  const { user, setAuth } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "pt";

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return tDashboard("roleAdmin");
      case "HR":
        return tDashboard("roleHr");
      case "MANAGER":
        return tDashboard("roleManager");
      case "EMPLOYEE":
        return tDashboard("roleEmployee");
      default:
        return role;
    }
  };

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

  // State fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [rg, setRg] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [bankCode, setBankCode] = useState("");
  const [bankAgency, setBankAgency] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [accountType, setAccountType] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || user.employee?.firstName || "");
      setLastName(user.lastName || user.employee?.lastName || "");
      setAvatarPreview(user.avatarUrl || user.employee?.avatarUrl || "");

      if (user.employee) {
        setPhone(user.employee.phone || "");
        setRg(user.employee.rg || "");
        if (user.employee.birthDate) {
          setBirthDate(user.employee.birthDate.split("T")[0]);
        }
        setGender(user.employee.gender || "");
        setMaritalStatus(user.employee.maritalStatus || "");

        if (user.employee.address) {
          setCep(user.employee.address.cep || "");
          setStreet(user.employee.address.street || "");
          setNumber(user.employee.address.number || "");
          setComplement(user.employee.address.complement || "");
          setNeighborhood(user.employee.address.neighborhood || "");
          setCity(user.employee.address.city || "");
          setState(user.employee.address.state || "");
        }

        if (user.employee.bankAccount) {
          setBankCode(user.employee.bankAccount.bankCode || "");
          setBankAgency(user.employee.bankAccount.bankAgency || "");
          setBankAccount(user.employee.bankAccount.bankAccount || "");
          setAccountType(user.employee.bankAccount.accountType || "");
        }
      }
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("phone", phone);
      formData.append("rg", rg);
      formData.append("birthDate", birthDate);
      formData.append("gender", gender);
      formData.append("maritalStatus", maritalStatus);

      formData.append("cep", cep);
      formData.append("street", street);
      formData.append("number", number);
      formData.append("complement", complement);
      formData.append("neighborhood", neighborhood);
      formData.append("city", city);
      formData.append("state", state);

      formData.append("bankCode", bankCode);
      formData.append("bankAgency", bankAgency);
      formData.append("bankAccount", bankAccount);
      formData.append("accountType", accountType);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      return api.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: async () => {
      toast(t("saveSuccess"), "success");
      await refreshUser();
      setAvatarFile(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Erro ao atualizar dados.";
      toast(msg, "error");
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      return api.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: async () => {
      toast("Imagem de perfil atualizada com sucesso!", "success");
      await refreshUser();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Erro ao atualizar avatar.";
      toast(msg, "error");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarPreview(URL.createObjectURL(file));
      updateAvatarMutation.mutate(file);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 w-full animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subTitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: General Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-muted/10 p-6 rounded-3xl flex flex-col items-center text-center space-y-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted/40 flex items-center justify-center border-0">
              {updateAvatarMutation.isPending && (
                <div className="absolute inset-0 bg-background/55 flex items-center justify-center z-10">
                  <CircleNotch className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
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
                {getRoleLabel(user?.role || "")}
              </span>
            </div>

            <div className="w-full pt-4 border-t border-muted/20 space-y-3">
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

              <Button
                type="button"
                onClick={() => router.push(`/${locale}/profile/change-password`)}
                className="flex items-center justify-center gap-1.5 w-full h-9 rounded-2xl bg-muted/30 hover:bg-muted/50 text-foreground text-xs font-bold transition-colors"
                variant="outline"
              >
                <Key className="w-4 h-4" />
                {t("changePassword")}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side: Forms */}
        <div className="md:col-span-2">
          <form onSubmit={handleProfileSubmit} className="space-y-8">
            {/* Personal Info Section */}
            <div className="bg-muted/5 p-6 rounded-3xl space-y-6 border-0">
              <FormSectionHeader
                title={t("personalInfo")}
                description="Dados de identificação e contato corporativo."
                icon={User}
              />

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

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Corporativo (Não editável)</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="h-10 rounded-2xl bg-muted/20 border-0 focus-visible:ring-1 opacity-65 cursor-not-allowed"
                  />
                </div>

                {user?.employee && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF (Não editável)</Label>
                      <Input
                        id="cpf"
                        value={user.employee.cpf || ""}
                        disabled
                        className="h-10 rounded-2xl bg-muted/20 border-0 focus-visible:ring-1 opacity-65 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        value={rg}
                        onChange={(e) => setRg(e.target.value)}
                        className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gênero</Label>
                      <Select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <Option value="MALE">Masculino</Option>
                        <Option value="FEMALE">Feminino</Option>
                        <Option value="OTHER">Outro / Prefiro não responder</Option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus">Estado Civil</Label>
                      <Select
                        id="maritalStatus"
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                      >
                        <Option value="SINGLE">Solteiro(a)</Option>
                        <Option value="MARRIED">Casado(a)</Option>
                        <Option value="DIVORCED">Divorciado(a)</Option>
                        <Option value="WIDOWED">Viúvo(a)</Option>
                      </Select>
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
                  </>
                )}
              </div>
            </div>

            {/* Address Section */}
            {user?.employee && (
              <div className="bg-muted/5 p-6 rounded-3xl space-y-6 border-0">
                <FormSectionHeader
                  title="Endereço Residencial"
                  description="Dados de localização residencial del colaborador."
                  icon={House}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                      placeholder="00000-000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Logradouro</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="state">Estado (UF)</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                      placeholder="EX: SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bank Account Section */}
            {user?.employee && (
              <div className="bg-muted/5 p-6 rounded-3xl space-y-6 border-0">
                <FormSectionHeader
                  title="Dados Bancários"
                  description="Conta para depósitos e pagamentos corporativos."
                  icon={CreditCard}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankCode">Código do Banco</Label>
                    <Input
                      id="bankCode"
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value)}
                      className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                      placeholder="Ex: 341"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAgency">Agência bancária</Label>
                    <Input
                      id="bankAgency"
                      value={bankAgency}
                      onChange={(e) => setBankAgency(e.target.value)}
                      className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Número da conta</Label>
                    <Input
                      id="bankAccount"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="h-10 rounded-2xl bg-background border-0 focus-visible:ring-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountType">Tipo de Conta</Label>
                    <Select
                      id="accountType"
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                    >
                      <Option value="CHECKING">Conta Corrente</Option>
                      <Option value="SAVINGS">Conta Poupança</Option>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="rounded-2xl text-sm font-bold h-10 px-8 border-0 bg-primary text-primary-foreground hover:bg-primary/95"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <CircleNotch className="w-4 h-4 animate-spin mr-1.5" />
                    {t("saving")}
                  </>
                ) : (
                  t("saveChanges")
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
